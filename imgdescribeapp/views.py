import os
import pickle
import random

import torch
from PIL import Image
from sentence_transformers import SentenceTransformer, util

from django.http import JsonResponse
from torch import nn
from torch.nn.utils.rnn import pack_padded_sequence
from torchvision import models, transforms

from quick_describe import settings

static_path = os.path.join(settings.BASE_DIR, 'static')
img_list = os.listdir(os.path.join(static_path, 'img', 'question_img'))
model = SentenceTransformer('stsb-roberta-large')


def start(request):
    random.shuffle(img_list)
    request.session['question_list'] = img_list[:]
    response = JsonResponse({'status': 'ok'})
    response.set_cookie('next_question', 0)

    return response


# /imgdescribe/next_img/:idx
def get_image_path(request, idx):
    response = JsonResponse({
        'path': f'static/img/question_img/{request.session["question_list"][idx]}'
    })
    response.set_cookie('next_question', idx+1)
    return response


def calc_sentence_score(request, idx, sent):
    ai_caption = get_caption(os.path.join(static_path, 'img', 'question_img', f'{request.session["question_list"][idx]}'))

    sent1 = model.encode(ai_caption)
    if sent == '-':
        sent = '.'
    sent2 = model.encode(sent)

    similarity = util.pytorch_cos_sim(sent1, sent2)

    return JsonResponse({'ai_caption': ai_caption, 'score': similarity.item() * 100})


class EncoderCNN(nn.Module):
    def __init__(self, embed_size):
        # 사전 학습된(pre-trained) ResNet-101을 불러와 FC 레이어를 교체
        super(EncoderCNN, self).__init__()
        resnet = models.resnet101(pretrained=True)
        modules = list(resnet.children())[:-1] # 마지막 FC 레이어를 제거
        self.resnet = nn.Sequential(*modules)
        self.linear = nn.Linear(resnet.fc.in_features, embed_size) # 결과(output) 차원을 임베딩 차원으로 변경
        self.bn = nn.BatchNorm1d(embed_size, momentum=0.01)

    def forward(self, images):
        # 입력 이미지에서 특징 벡터(feature vectors)
        with torch.no_grad(): # 네트워크의 앞 부분은 변경되지 않도록 하기
            features = self.resnet(images)
        features = features.reshape(features.size(0), -1)
        features = self.bn(self.linear(features))
        return features


class DecoderRNN(nn.Module):
    def __init__(self, embed_size, hidden_size, vocab_size, num_layers, max_seq_length=20):
        # 하이퍼 파라미터(hyper-parameters) 설정 및 레이어 생성
        super(DecoderRNN, self).__init__()
        self.embed = nn.Embedding(vocab_size, embed_size)
        self.lstm = nn.LSTM(embed_size, hidden_size, num_layers, batch_first=True)
        self.linear = nn.Linear(hidden_size, vocab_size)
        self.max_seg_length = max_seq_length

    def forward(self, features, captions, lengths):
        # 이미지 특징 벡터(feature vectors)로부터 캡션(caption) 생성
        embeddings = self.embed(captions)
        embeddings = torch.cat((features.unsqueeze(1), embeddings), 1) # 이미지 특징과 임베딩 연결
        packed = pack_padded_sequence(embeddings, lengths, batch_first=True) # 패딩을 넣어 차원 맞추기
        hiddens, _ = self.lstm(packed) # 다음 hidden state 구하기
        outputs = self.linear(hiddens[0])
        return outputs

    def sample(self, features, states=None):
        # 간단히 그리디(greedy) 탐색으로 캡션(caption) 생성하기
        sampled_indexes = []
        inputs = features.unsqueeze(1)
        for i in range(self.max_seg_length):
            hiddens, states = self.lstm(inputs, states) # hiddens: (batch_size, 1, hidden_size)
            outputs = self.linear(hiddens.squeeze(1)) # outputs: (batch_size, vocab_size)
            _, predicted = outputs.max(1) # predicted: (batch_size)
            sampled_indexes.append(predicted)
            inputs = self.embed(predicted) # inputs: (batch_size, embed_size)
            inputs = inputs.unsqueeze(1) # inputs: (batch_size, 1, embed_size)
        sampled_indexes = torch.stack(sampled_indexes, 1) # sampled_indexes: (batch_size, max_seq_length)
        return sampled_indexes


def load_image(image_path, transform=None):
    crop_size = 224

    image = Image.open(image_path).convert('RGB')
    image = image.resize([crop_size, crop_size], Image.LANCZOS)

    if transform is not None:
        image = transform(image).unsqueeze(0)

    return image


def get_caption(img_path):
    encoder_path = os.path.join(static_path, "ml", "encoder-5.ckpt")
    decoder_path = os.path.join(static_path, "ml", "decoder-5.ckpt")
    vocab_path = os.path.join(static_path, "ml", "vocab.pkl")

    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

    # Model parameters (should be same as paramters in train.py)
    embed_size = 256  # dimension of word embedding vectors
    hidden_size = 512  # dimension of lstm hidden states
    num_layers = 1  # number of layers in lstm

    # 이미지 전처리(image preprocessing)
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.485, 0.456, 0.406), (0.229, 0.224, 0.225))])

    # Load vocabulary wrapper
    with open(vocab_path, "rb") as f:
        vocab = pickle.load(f)

    # Build models
    encoder = EncoderCNN(embed_size).eval()  # eval mode (batchnorm uses moving mean/variance)
    decoder = DecoderRNN(embed_size, hidden_size, len(vocab), num_layers)
    encoder = encoder.to(device)
    decoder = decoder.to(device)

    # Load the trained model parameters
    encoder.load_state_dict(torch.load(encoder_path, map_location=device))
    decoder.load_state_dict(torch.load(decoder_path, map_location=device))

    # Prepare an image
    image = load_image(img_path, transform)
    image_tensor = image.to(device)

    # Generate an caption from the image
    feature = encoder(image_tensor)
    sampled_ids = decoder.sample(feature)
    sampled_ids = sampled_ids[0].cpu().numpy()  # (1, max_seq_length) -> (max_seq_length)

    # Convert word_ids to words
    sampled_caption = []
    for word_id in sampled_ids:  # 하나씩 단어 인덱스를 확인하며
        word = vocab.idx2word[word_id]  # 단어 문자열로 바꾸어 삽입
        sampled_caption.append(word)
        if word == '<end>':
            break
    sentence = ' '.join(sampled_caption[1:-2]) + '.'

    return sentence





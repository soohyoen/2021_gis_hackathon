import torch

from transformers import BertTokenizer
from PIL import Image
import argparse

from .models import caption
from .datasets import coco, utils
from .configuration import Config
import os

# parser = argparse.ArgumentParser(description='Image Captioning')
# parser.add_argument('--path', type=str, help='path to image', required=True)
# args = parser.parse_args()
# image_path = args.path

model = None;
if not model:
    model = torch.hub.load('saahiluppal/catr', 'v3', pretrained=True)

def get_caption(image_path):
    config = Config()

    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

    start_token = tokenizer.convert_tokens_to_ids(tokenizer._cls_token)
    end_token = tokenizer.convert_tokens_to_ids(tokenizer._sep_token)

    image = Image.open(image_path)
    image = coco.val_transform(image)
    image = image.unsqueeze(0)


    def create_caption_and_mask(start_token, max_length):
        caption_template = torch.zeros((1, max_length), dtype=torch.long)
        mask_template = torch.ones((1, max_length), dtype=torch.bool)

        caption_template[:, 0] = start_token
        mask_template[:, 0] = False

        return caption_template, mask_template


    caption, cap_mask = create_caption_and_mask(
        start_token, config.max_position_embeddings)


    @torch.no_grad()
    def evaluate():
        model.eval()
        for i in range(config.max_position_embeddings - 1):
            predictions = model(image, caption, cap_mask)
            predictions = predictions[:, i, :]
            predicted_id = torch.argmax(predictions, axis=-1)

            if predicted_id[0] == 102:
                return caption

            caption[:, i+1] = predicted_id[0]
            cap_mask[:, i+1] = False

        return caption


    output = evaluate()
    result = tokenizer.decode(output[0].tolist(), skip_special_tokens=True)

    print(result.capitalize())

    return result.capitalize()

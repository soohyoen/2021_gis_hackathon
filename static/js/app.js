import { getCookie, getRequest } from './utils.js'
import { startTimer, onTimesUp } from './timer.js';

const mainView = document.getElementById('mainview');
const gameView = document.getElementById('gameview');
const resultView = document.getElementById('resultview');
const loadingMask = document.querySelector('#mask');

//======================================================================================================================
// 페이지 전환 및 이미지 로딩 함수

function loadImage(curBlockPage, curNonePage) {
    loadingMask.style.display = 'block';
    getRequest(`/imgdescribe/next_img/${getCookie('next_question')}`,
        (json, args) => {
            const img = gameView.querySelector('img');
            img.src = json['path'];

            const resultImg = resultView.querySelector('img');
            resultImg.src = json['path'];

            loadPage(args[0], args[1]);
            loadingMask.style.display = 'none';

        }, curBlockPage, curNonePage);
}

function loadPage(curBlockPage, curNonePage) {
    if (curNonePage.id === 'gameview') { startTimer(); }
    curBlockPage.style.display = 'none';
    curNonePage.style.display = 'flex';
}

//======================================================================================================================
// 각종 버튼에 대한 이벤트 리스너

const startBtn = mainView.querySelector('#start');
startBtn.addEventListener('click', gameStart);

function gameStart(e) {
    e.preventDefault();
    getRequest('/imgdescribe/start', (_, args) => loadImage(args[0], args[1]), mainView, gameView);
}

const submitBtn = gameView.querySelector('button');
submitBtn.addEventListener('click', submitSentence);

gameView.querySelector('input').oninput = function(e) {
    if (e.target.value === '') {
        gameView.querySelector('button').disabled = true;
    } else {
        gameView.querySelector('button').disabled = false;
    }
}

export function submitSentence() {
    onTimesUp();

    const user_input = gameView.querySelector('input');
    resultView.querySelector('#user_answer').innerHTML = user_input.value;

    let userSentence = user_input.value;
    if (userSentence === '') { userSentence = '-' }

    loadingMask.style.display = 'block';
    getRequest(`imgdescribe/score/${getCookie('next_question')-1}/${userSentence}`,
        (json, args) => {
            const ai_text = resultView.querySelector('#ai_answer');
            ai_text.innerHTML = json['ai_caption'];
            // alert(json['score']);

            user_input.value = '';
            gameView.querySelector('button').disabled = true;
            loadingMask.style.display = 'none';

            loadPage(args[0], args[1]);
        }, gameView, resultView);
}

const continueBtn = resultView.querySelector('#continue');
continueBtn.addEventListener('click', continueGame);

function continueGame(e) {
    e.preventDefault();
    loadImage(resultView, gameView);
}

const exitBtn = resultView.querySelector('#exit');
exitBtn.addEventListener('click', exit);

function exit(e) {
    e.preventDefault();
    loadPage(resultView, mainView);
}
const startBtn = document.querySelector('#mainview a');

startBtn.addEventListener('click', gameStart);

function loadImage(curBlockPage, curNonePage) {

    const mask = document.querySelector('#mask');
    mask.style.display = 'block';
    fetch(`/imgdescribe/next_img/${getCookie('next_question')}`)
        .then(response => {
            return response.json();
        })
        .then(json => {
            const img = document.querySelector('#gameview img');
            img.src = json['path'];

            const result_img = document.querySelector('#resultview img');
            result_img.src = json['path'];

            loadPage(curBlockPage, curNonePage);
            mask.style.display = 'none';
        });
}

function loadPage(curBlockPage, curNonePage) {
    curBlockPage.style.display = 'none';
    curNonePage.style.display = 'block';
}

function gameStart(e) {
    e.preventDefault();

    const gameview = document.querySelector('#gameview');
    const mainview = document.querySelector('#mainview');

    fetch('/imgdescribe/start')
        .then(response => {
            loadImage(mainview, gameview);
        });
}

const submitBtn = document.querySelector('#gameview button');
submitBtn.addEventListener('click', submit);

function submit(e) {
    e.preventDefault();

    const gameview = document.querySelector('#gameview');
    const resultview = document.querySelector('#resultview');

    const user_input = gameview.querySelector('input');
    resultview.querySelector('#user_answer').innerHTML = user_input.value;

    fetch(`imgdescribe/score/${getCookie('next_question')-1}/${user_input.value}`)
        .then(response => {
            return response.json();
        })
        .then(json => {
            const ai_text = resultview.querySelector('#ai_answer');
            ai_text.innerHTML = json['ai_caption'];
            alert(json['score'])

            loadPage(gameview, resultview);
        });
}

const continueBtn = document.querySelector('#continue');
continueBtn.addEventListener('click', continueFunc);

function continueFunc(e) {
    e.preventDefault();

    const gameview = document.querySelector('#gameview');
    const resultview = document.querySelector('#resultview');

    loadImage(resultview, gameview);
}

const exitBtn = document.querySelector('#exit');
exitBtn.addEventListener('click', exit);

function exit(e) {
    e.preventDefault();

    const mainview = document.querySelector('#mainview');
    const resultview = document.querySelector('#resultview');

    loadPage(resultview, mainview);
}



// utils
function getCookie(cookieName){
    let cookieValue=null;
    if(document.cookie){
        const array = document.cookie.split((escape(cookieName)+'='));
        if(array.length >= 2){
            const arraySub=array[1].split(';');
            cookieValue=unescape(arraySub[0]);
        }
    }
    return cookieValue;
}
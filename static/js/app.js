const startBtn = document.querySelector('#mainview a');

startBtn.addEventListener('click', gameStart);

function loadImage(curBlockPage, curNonePage) {

    const mask = document.querySelector('#mask');
    mask.style.display = 'block';
    fetch('https://picsum.photos/500/400')
        .then(response => {
            mask.style.display = 'none';
            const img = document.querySelector('#gameview img');
            img.src = response.url;

            const result_img = document.querySelector('#resultview img');
            result_img.src = response.url;

            loadPage(curBlockPage, curNonePage);
        })
}

function loadPage(curBlockPage, curNonePage) {
    curBlockPage.style.display = 'none';
    curNonePage.style.display = 'block';
}

function gameStart(e) {
    e.preventDefault();

    const gameview = document.querySelector('#gameview');
    const mainview = document.querySelector('#mainview');

    loadImage(mainview, gameview);
}

const submitBtn = document.querySelector('#gameview button');
submitBtn.addEventListener('click', submit);

function submit(e) {
    e.preventDefault();

    const gameview = document.querySelector('#gameview');
    const resultview = document.querySelector('#resultview');

    const user_input = gameview.querySelector('input');
    resultview.querySelector('#user_answer').innerHTML = user_input.value;
    user_input.value = '';

    loadPage(gameview, resultview);
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

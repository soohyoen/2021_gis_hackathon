const startBtn = document.querySelector('#main a');

startBtn.addEventListener('click', gameStart);

function loadImage() {
    const ajax = new XMLHttpRequest();
    ajax.open('get', 'https://picsum.photos/500/400', false);
    ajax.send();

    const img = document.querySelector('#gameview img');
    img.src = ajax.responseURL;

    const result_img = document.querySelector('#mask img');
    result_img.src = ajax.responseURL;
}

function gameStart(e) {
    e.preventDefault();

    const gameview = document.querySelector('#gameview');
    const mainview = document.querySelector('#main');

    mainview.style.display = 'none';
    gameview.style.display = 'block';

    loadImage();
}

const submitBtn = document.querySelector('#gameview button');
submitBtn.addEventListener('click', submit);

function submit(e) {
    e.preventDefault();

    const gameview = document.querySelector('#gameview');
    const mask = document.querySelector('#mask');

    mask.style.display = 'block';
    gameview.style.display = 'none';
}

const continueBtn = document.querySelector('#continue');
continueBtn.addEventListener('click', continueFunc);

function continueFunc(e) {
    e.preventDefault();

    const gameview = document.querySelector('#gameview');
    const mask = document.querySelector('#mask');

    mask.style.display = 'none';
    gameview.style.display = 'block';

    loadImage();
}

const exitBtn = document.querySelector('#exit');
exitBtn.addEventListener('click', exit);

function exit(e) {
    e.preventDefault();

    const mainview = document.querySelector('#main');
    const mask = document.querySelector('#mask');

    mask.style.display = 'none';
    mainview.style.display = 'block';
}

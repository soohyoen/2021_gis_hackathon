const startBtn = document.querySelector('#main a');

startBtn.addEventListener('click', gameStart);

function gameStart(e) {
    e.preventDefault();

    const gameview = document.querySelector('#gameview');
    const mainview = document.querySelector('#main');

    mainview.style.display = 'none';
    gameview.style.display = 'block';
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

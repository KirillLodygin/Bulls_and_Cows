const selectionBtns = document.getElementById('selection-buttons-block');
const replyBtn = document.getElementById('reply');
const passBtn = document.getElementById('pass');
const restartBtn = document.getElementById('restart');

let gameVersion, rounds, roundCounter, isVictory, info;
const MIN = 20,
  MAX = 30,
  NUMBER_OF_DIGITS_TO_GUESS = 4,
  hiddenNumber = [],
  bullsAndCows = [],
  blankCell = '&#32;',
  cowCell = '&#101;',
  bullCell = '&#99;';

const startGame = () => {
  document.getElementById('enter-the-game').style.display = 'flex';
  document.getElementById('game-field').style.display = 'none';
  document.getElementById('challenge').innerHTML = '';
};

const getRandomInteger = (min, max) => {
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
};

const chooseEnding = num => {
  if (num === 1) return ' ход';
  if (1 < num && num < 5) return ' хода';
  return ' ходов';
};

const isGameVersionEasy = gameVersion => gameVersion === 'easily';

const sendMessageToDialog = message => {
  document.getElementById('dialog').innerHTML = message;
  document.getElementById('dialog').scrollTop =
    document.getElementById('dialog').clientHeight;
};

const chooseLevel = levelDifficulty => {
  isVictory = false;
  roundCounter = 0;
  info = '';

  document.getElementById('enter-the-game').style.display = 'none';
  document.getElementById('game-field').style.display = 'flex';
  document.getElementById('captured-bulls').innerHTML = '';
  sendMessageToDialog(info);

  replyBtn.style.display = 'inline-block';
  passBtn.style.display = 'inline-block';
  restartBtn.style.display = 'none';

  gameVersion = levelDifficulty;

  switch (gameVersion) {
    case 'very-difficult':
      rounds = getRandomInteger(MIN, MAX);
      document.getElementById(
        'challenge',
      ).innerHTML = `На этом уровне ты должен собрать всех быков за ${rounds}${chooseEnding(
        Number(String(rounds).split('')[1]),
      )}`;
      break;

    case 'hard':
      document.getElementById('challenge').innerHTML =
        'На этом уровне известно только, сколько коров или быков поймано';
      break;

    default:
      document.getElementById('challenge').innerHTML =
        'На этом уровне известно расположение каждой пойманной коровы или быка';
  }

  hiddenNumber[0] = Math.floor(Math.random() * 10);
  for (let i = 1; i < NUMBER_OF_DIGITS_TO_GUESS; i++) {
    let num = getRandomInteger(0, 9);

    while (hiddenNumber.includes(num)) {
      num = getRandomInteger(0, 9);
    }

    hiddenNumber[i] = num;
  }
};

const finishGame = () => {
  restartBtn.style.display = 'block';
  replyBtn.style.display = 'none';
  passBtn.style.display = 'none';
};

const choosePass = () => {
  document.getElementById(
    'challenge',
  ).innerHTML = `Сделано ходов: ${roundCounter}`;

  sendMessageToDialog('Быстро же ты сдался!');

  document.getElementById('answer').value = '';
  finishGame();
};

const getBullsAndCowArr = versionNum => {
  let bulls = 0,
    cows = 0,
    i = 0;

  versionNum.split('').forEach((item, index) => {
    if (!hiddenNumber.includes(Number(item))) {
      return;
    }

    if (hiddenNumber.indexOf(Number(item)) !== index) {
      cows += 1;

      if (isGameVersionEasy(gameVersion)) {
        bullsAndCows[index] = cowCell;
      } else {
        bullsAndCows[i] = cowCell;
        i += 1;
      }

      return;
    }

    bulls += 1;

    if (isGameVersionEasy(gameVersion)) {
      bullsAndCows[index] = bullCell;
    } else {
      bullsAndCows[i] = bullCell;
      i += 1;
    }
  });

  if (!isGameVersionEasy(gameVersion)) {
    bullsAndCows.sort();
  }

  let capturedBulls = '';
  bullsAndCows.forEach(item => {
    if (item === blankCell) {
      if (isGameVersionEasy(gameVersion)) {
        capturedBulls += blankCell;
      } else {
        capturedBulls += '';
      }
    } else {
      capturedBulls += item;
    }
  });

  document.getElementById('captured-bulls').innerHTML = capturedBulls;

  return [bulls, cows];
};

const startRound = () => {
  const guess = document.getElementById('answer').value;

  for (let i = 0; i < NUMBER_OF_DIGITS_TO_GUESS; i++) {
    bullsAndCows[i] = blankCell;
  }

  document.getElementById('challenge').innerHTML =
    gameVersion === 'very-difficult'
      ? `Ход ${++roundCounter}. Оставшихся ходов ${rounds - roundCounter}`
      : `Ход ${++roundCounter}`;

  if (!guess.match(/^\d+$/) || guess.length !== NUMBER_OF_DIGITS_TO_GUESS) {
    info += 'Ты не забыл, что нужно ввести четыре цифры без пробелов?\n';
    sendMessageToDialog(info);
    return;
  }

  let bullsAndCowsArr = getBullsAndCowArr(guess);

  info += `Ты ввел ${guess}.\nKоров: ${bullsAndCowsArr[1]}, быков: ${bullsAndCowsArr[0]}.\n`;
  isVictory = bullsAndCowsArr[0] === NUMBER_OF_DIGITS_TO_GUESS;

  if (isVictory) {
    info = 'Победа! Ты собрал всех быков!';
    finishGame();
  } else {
    if (roundCounter === rounds && gameVersion !== 'easily') {
      info = 'Однако ты проиграл! Не успел собрать быков!';
      finishGame();
    }
  }

  sendMessageToDialog(info);

  setTimeout(() => {
    document.getElementById('answer').value = '';
  }, 500);
};

startGame();

selectionBtns.addEventListener('click', evt => {
  const difficulty = evt.target.getAttribute('data-diff');
  chooseLevel(difficulty);
});
passBtn.addEventListener('click', choosePass);
replyBtn.addEventListener('click', startRound);
restartBtn.addEventListener('click', startGame);

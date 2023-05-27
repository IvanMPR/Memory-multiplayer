import { socket, helperObject, playersClient } from '../script.js';
export const cards = [
  'barcode',
  'barcode',
  'bitcoin',
  'bitcoin',
  'camera',
  'camera',
  'compass',
  'compass',
  'empty',
  'empty',
  'envelope',
  'envelope',
  'full',
  'full',
  'gauge',
  'gauge',
  'helicopter',
  'helicopter',
  'icons',
  'icons',
  'pattern',
  'pattern',
  'protractor',
  'protractor',
  'safe',
  'safe',
  'scope',
  'scope',
  'shutter',
  'shutter',
  'social',
  'social',
  'target',
  'target',
  'time',
  'time',
];
export const DELAY_TIME = 1500;
export const cardFields = document.querySelectorAll('.game-fields');
export const cardsContainer = document.querySelector('.cards-container');
export const startButton = document.querySelector('.start-btn');
export const restartButton = document.querySelector('.restart-btn');
export const inputDiv = document.querySelector('.input-div');
export const nameInput = document.querySelector('.name-input');
export const nameButton = document.querySelector('.name-btn');
export const infoDiv = document.querySelector('.info');
export const playersNames = document.querySelectorAll('.player-h2');

// ----------------------HELPER FUNCTIONS----------------------//
//-------------------------------------------------------------//

export function resetHelperObject() {
  helperObject.guesses = [];
  helperObject.id = [];
  cardsContainer.style.pointerEvents = 'initial';
}

export function toggleHideShow(el, classList = 'hidden') {
  return document.getElementById(`${el}`).classList.toggle(`${classList}`);
}

export function displayUiMessage(message) {
  infoDiv.innerHTML = '';
  infoDiv.textContent = message;
}

export function renderPlayerNames(playersArray) {
  playersArray.forEach((player, i) => {
    playersNames[i].textContent = `${player.username}`;
  });
}

export function markActivePlayer(activePlayer) {
  playersNames.forEach(name => {
    name.classList.remove('active-player');
  });
  document
    .querySelector(`.player-${activePlayer}-h2`)
    .classList.add('active-player');
}

export function displayCurrentPlayerTurn() {
  const activePlayerName = document.querySelector(
    `.player-${helperObject.activePlayer}-h2`
  ).textContent;
  displayUiMessage(`${activePlayerName} is on the move!`);
}

export function preventWrongSocketInput() {
  const name = playersClient.filter(player => player.id === socket.id)[0]
    .username;
  const activePlayerName = document.querySelector('.active-player').textContent;

  return name !== activePlayerName;
}

export function declareWinner(score) {
  if (score[0] > score[1]) {
    winner(0);
  } else if (score[0] < score[1]) {
    winner(1);
  } else {
    displayUiMessage(`It's a tie!`);
    showRestartButton();
  }
}

export function restartGame() {
  resetHelperObject();
  socket.emit('restart game');
}

export function startGame(shuffledCardsArray) {
  startGameTone();
  cardFields.forEach((field, i) => {
    field.style.backgroundImage = `url(./memory_cards/${shuffledCardsArray[i]}.jpg)`;
    field.classList.add('hidden');
  });
  document
    .querySelectorAll('.gf-wrapper')
    .forEach(wrapper => wrapper.classList.remove('hidden'));
  cardsContainer.style.pointerEvents = 'initial';
}
export function addHiddenClass(id) {
  document.getElementById(`${id}`).classList.add('hidden');
}

export function disableMouseClick() {
  cardsContainer.style.pointerEvents = 'none';
}

function clearActivePlayer() {
  playersNames.forEach(name => {
    name.classList.remove('active-player');
  });
}
function showRestartButton() {
  restartButton.closest('.restart-button-div').classList.remove('inactive');
}

function winner(position) {
  const winner = document.querySelector(`.player-${position}-h2`).textContent;
  displayUiMessage(`${winner} won the game!`);
  showRestartButton();
  clearActivePlayer();
  cardsContainer.style.pointerEvents = 'none';
}

// ---------------------------------------------- Audio files ----------------------------------------------//
// --------------------------------------------------------------------------------------------------------//

export const flipSound = function () {
  const tone = new Audio('./sounds/369960__mischy__umblattern-kurz.wav');
  return tone.play();
};

export const pairHit = function () {
  const tone = new Audio('./sounds/528867__eponn__beep-5.wav');
  return tone.play();
};

export const errorTone = function () {
  const tone = new Audio('./sounds/344687__korground__error-sound.wav');
  return tone.play();
};

export const pairMissTone = function () {
  const tone = new Audio(
    './sounds/140773__qubodup__computer-beep-sfx-for-videogames.wav'
  );
  return tone.play();
};

export const startGameTone = function () {
  const tone = new Audio('./sounds/350872__cabled-mess__coin-c-01.wav');
  return tone.play();
};

export const endGameTone = function () {
  const tone = new Audio('./sounds/320775__rhodesmas__win-02.wav');
  return tone.play();
};

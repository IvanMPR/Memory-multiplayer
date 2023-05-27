export const socket = io();
// constants - IMPORTS
import { DELAY_TIME } from './utils/client-utils.js';
// selection of DOM elements - IMPORTS
// prettier-ignore
import { cardsContainer, startButton,restartButton, inputDiv, nameInput, nameButton, playersNames, endGameTone } from './utils/client-utils.js';
// helper functions - IMPORTS
// prettier-ignore
import {startGame, declareWinner, addHiddenClass,toggleHideShow, preventWrongSocketInput, markActivePlayer, displayUiMessage, renderPlayerNames, restartGame, resetHelperObject, displayCurrentPlayerTurn, disableMouseClick} from './utils/client-utils.js';
// audio files - IMPORTS
// prettier-ignore
import { flipSound, pairHit, errorTone, pairMissTone, } from './utils/client-utils.js';

export const playersClient = [];
export const helperObject = {
  guesses: [],
  id: [],
  activePlayer: undefined,
};

addEventListener('load', function () {
  // Disable click event on memory cards before start button is pressed
  disableMouseClick();
});

// First listener on cardsContainer. Checks if e.target is correct and pushes two attributes to helperObject
cardsContainer.addEventListener('click', function (e) {
  // prevents player who is not on turn to click on cards
  if (preventWrongSocketInput()) {
    errorTone();
    displayUiMessage('Please Wait For Your Turn !');
    return;
  }
  // guard clause for not clicking on the card inside of the cardsContainer
  if (!e.target.classList.contains('game-fields')) return;
  // emit card opened event to server
  socket.emit('card opened', e.target.id);
  // reveal card in active client
  e.target.classList.toggle('hidden');
  // store opened card data temporarily for comparison
  helperObject.guesses.push(e.target.style.backgroundImage);
  helperObject.id.push(e.target.id);
});

// Second listener on cardsContainer prevents double click on opened card and determines whether the guess is true or false
cardsContainer.addEventListener('click', function () {
  // prevents player who is not on turn to click on cards
  if (preventWrongSocketInput()) {
    errorTone();
    displayUiMessage('Please Wait For Your Turn !');
    return;
  }

  // Returns if only one card is open
  if (helperObject.guesses.length !== 2) return;
  //  Below IF Block prevents clicking on already opened card
  if (helperObject.id[0] === helperObject.id[1]) {
    disableMouseClick();
    socket.emit('same card clicked', {
      id: helperObject.id[0],
      activePlayer: helperObject.activePlayer,
    });
    addHiddenClass(helperObject.id[0]);
    resetHelperObject();
    errorTone();
    displayUiMessage("You can't click on the same card twice!");

    return;
  }

  // Below IF block closes cards if they are not the same
  if (helperObject.guesses[0] !== helperObject.guesses[1]) {
    // disable click event on memory cards in between the moves
    disableMouseClick();
    // emit missed pair event to server
    socket.emit('missed pair', {
      missedPair: [helperObject.id[0], helperObject.id[1]],
      activePlayer: helperObject.activePlayer,
    });
    // in active client...
    setTimeout(() => {
      // Hide first card
      toggleHideShow(helperObject.id[0]);
      // Hide second card
      toggleHideShow(helperObject.id[1]);
      // play missed pair tone
      pairMissTone();
      // reset helper object
      resetHelperObject();
    }, DELAY_TIME);

    // Else block from below handles true guess
  } else {
    // Disable click event on memory cards in between the moves
    disableMouseClick();
    // update score
    helperObject[`score${helperObject.activePlayer}`] += 1;
    // emit true pair event to server
    socket.emit('true pair', {
      truePair: [helperObject.id[0], helperObject.id[1]],
      activePlayer: helperObject.activePlayer,
    });
    // in active client...
    setTimeout(() => {
      // Hide first card and it's parent div wrapper
      addHiddenClass(helperObject.id[0]);
      document
        .getElementById(`${helperObject.id[0]}`)
        .closest('.gf-wrapper').style.visibility = 'hidden';
      // Hide second card and it's parent div wrapper
      addHiddenClass(helperObject.id[1]);
      document
        .getElementById(`${helperObject.id[1]}`)
        .closest('.gf-wrapper').style.visibility = 'hidden';
      // play pair hit tone
      pairHit();
      // reset helper object
      resetHelperObject();
    }, DELAY_TIME);
  }
});

startButton.addEventListener('click', function () {
  inputDiv.classList.remove('inactive');
  nameInput.focus();
  this.closest('.button-div').classList.add('inactive');
});

nameButton.addEventListener('click', function () {
  if (nameInput.value === '') {
    displayUiMessage('Please enter your username before starting the game');
    nameInput.focus();
    return;
  }

  const username = nameInput.value;

  socket.emit('new player', username);
  // clear input field and grey out input div
  nameInput.value = '';
  inputDiv.classList.add('inactive');
});

restartButton.addEventListener('click', restartGame);

// ------------------------------ SOCKETS HANDLERS ------------------------------ //

socket.on('new player connected', playersServer => {
  renderPlayerNames(playersServer);
  // keep the copy of the players array from server side to client side
  playersClient.length === 0
    ? playersClient.push(...playersServer)
    : playersClient.push(playersServer.pop());
});

socket.on('waiting for second player', () => {
  displayUiMessage('Waiting for second player to connect...');
});

socket.on('active player', activePlayer => {
  helperObject.activePlayer = activePlayer;
  markActivePlayer(helperObject.activePlayer);
  displayCurrentPlayerTurn();
});

socket.on('active player change', newActivePlayer => {
  playersNames.forEach(name => name.classList.remove('active-player'));

  helperObject.activePlayer = newActivePlayer;
  markActivePlayer(helperObject.activePlayer);
  displayCurrentPlayerTurn();
});

socket.on('both players connected', data => {
  startGame(data.memoryCards);
  displayUiMessage('Both players connected. Starting the game...');
});

socket.on('show opened card', openedCardId => {
  document.getElementById(`${openedCardId}`).classList.remove('hidden');
  flipSound();
});

socket.on('same card invalid move', data => {
  displayUiMessage('Opponent clicked on the same card twice.');
  errorTone();
  document.getElementById(`${data.id}`).classList.add('hidden');
});
// sound-effects
socket.on('play card opened sound', () => flipSound());

socket.on('close true pair', data => {
  setTimeout(() => {
    data.truePair.forEach(cardId => {
      document.getElementById(`${cardId}`).classList.add('hidden');
      document
        .getElementById(`${cardId}`)
        .closest('.gf-wrapper').style.visibility = 'hidden';
    });
    pairHit();
  }, DELAY_TIME);
});

socket.on('close missed pair', data => {
  setTimeout(() => {
    data.missedPair.forEach(cardId => {
      document.getElementById(`${cardId}`).classList.add('hidden');
    });
    pairMissTone();
  }, DELAY_TIME);

  socket.on('update score', score => {
    document.querySelector('.pairs-0').textContent = score[0];
    document.querySelector('.pairs-1').textContent = score[1];
  });

  socket.on('restart game board', () => {
    document.querySelectorAll('.gf-wrapper').forEach(wrapper => {
      wrapper.style.visibility = 'visible';
    });
    document
      .querySelector('.restart-btn')
      .closest('.restart-button-div')
      .classList.add('inactive');
  });

  socket.on('game over', score => {
    declareWinner(score);
    endGameTone();
  });
});

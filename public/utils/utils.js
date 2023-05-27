const cards = [
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
const score = [0, 0];
const playersServer = [];
const DELAY_TIME = 1500;
// Knuth-Yates shuffle function. ! Borrowed code ! Shuffles cards on start of the level
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  //While there remain elements to shuffle...
  while (0 !== currentIndex) {
    //Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    //And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function isGameOver(score, endGameNumber) {
  const currentRound = score[0] + score[1];
  return currentRound === endGameNumber;
}

const updateScore = (scoreArray, activePlayer) =>
  (scoreArray[activePlayer] += 1);

const resetScore = scoreArray => {
  scoreArray[0] = 0;
  scoreArray[1] = 0;
};

module.exports = {
  cards,
  shuffle,
  updateScore,
  resetScore,
  isGameOver,
  playersServer,
  score,
  DELAY_TIME,
};

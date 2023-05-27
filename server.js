const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const {
  cards,
  shuffle,
  updateScore,
  resetScore,
  isGameOver,
  playersServer,
  score,
  DELAY_TIME,
} = require('./public/utils/utils');

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
// --------------- SOCKETS HANDLING -------------------- //
io.on('connection', socket => {
  socket.on('new player', username => {
    // create player object
    const player = {
      username,
      id: socket.id,
      score: 0,
    };

    // if two playersServer are already connected, reject attempted connection
    if (playersServer.length === 2) {
      socket.disconnect();
      return;
    }
    // add newly connected player to playersServer array
    playersServer.push(player);

    if (playersServer.length === 1) {
      socket.emit('waiting for second player');
    }
    if (playersServer.length === 2) {
      io.emit('both players connected', { memoryCards: shuffle(cards) });
      resetScore(score);
      // start game after 1.5s
      setTimeout(() => {
        let activePlayer = Math.floor(Math.random() * 2);
        io.emit('active player', activePlayer);
      }, DELAY_TIME);
    }

    io.emit('new player connected', playersServer);
  });

  socket.on('card opened', openedCardId => {
    socket.broadcast.emit('show opened card', openedCardId);
    io.emit('play card opened sound');
  });

  socket.on('same card clicked', data => {
    socket.broadcast.emit('same card invalid move', data);
    setTimeout(() => {
      const newActivePlayer = data.activePlayer === 0 ? 1 : 0;
      io.emit('active player change', newActivePlayer);
    }, DELAY_TIME);
  });

  socket.on('true pair', data => {
    socket.broadcast.emit('close true pair', data);
    updateScore(score, data.activePlayer);
    io.emit('update score', score);
    if (isGameOver(score, cards.length / 2)) {
      io.emit('game over', score);
    }
  });

  socket.on('missed pair', data => {
    socket.broadcast.emit('close missed pair', data);
    setTimeout(() => {
      const newActivePlayer = data.activePlayer === 0 ? 1 : 0;
      io.emit('active player change', newActivePlayer);
    }, DELAY_TIME);
  });

  socket.on('restart game', () => {
    io.emit('restart game board');
    io.emit('both players connected', { memoryCards: shuffle(cards) });
    resetScore(score);
    // start game after 1.5s
    setTimeout(() => {
      let activePlayer = Math.floor(Math.random() * 2);
      io.emit('active player', activePlayer);
      io.emit('update score', score);
    }, DELAY_TIME);
    io.emit('new player connected', playersServer);
  });
});
// --------------- PORT ---------------- //
const PORT = process.env.PORT || 3000;
server.listen(PORT);

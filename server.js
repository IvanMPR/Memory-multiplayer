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
      socket.emit('no room');
      console.log('disconnected');
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
      }, 1500);
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
    }, 1500);
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
    // io.emit('play card opened sound');
    socket.broadcast.emit('close missed pair', data);
    setTimeout(() => {
      const newActivePlayer = data.activePlayer === 0 ? 1 : 0;
      io.emit('active player change', newActivePlayer);
    }, 1500);
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
    }, 1500);
    io.emit('new player connected', playersServer);
  });

  // ------------------- IF PLAYER LEAVES DURING THE GAME --------------------- //
  socket.on('disconnect', () => {
    // disconnected player id
    const id = socket.id;
    // declare variables that will be sent by the 'player left event'
    let position;
    let playerName;

    if (!playersServer.some(player => player.id === id)) {
      return;
    }
    // delete disconnected player from players array
    if (playersServer.length > 0) {
      // determine if first or second player has left the game
      position = playersServer[0].id === id ? 0 : 1;
      // get username of the player who left
      playerName = playersServer[position].username;
      // remove first or last player from the array, depending who has left
      position === 0 ? playersServer.shift() : playersServer.pop();
    }

    // emit left event, and send data about player who has left, that will be used to inform remaining player
    io.emit('player left game', { playerName, position });
  });
});
// --------------- PORT ---------------- //
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

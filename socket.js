module.exports = function(app, rdio, host) {

  var io = require('socket.io').listen(app);
  var chat = {};
  var currentTracks = {};

  io.sockets.on('connection', function(socket) {


    socket.on('join', function(roomName) {
      console.log("user joined room: "+roomName);
      socket.join(roomName);
      socket.set('room', roomName);
      var clients = io.sockets.clients(roomName);
      console.log("users in room "+roomName+": "+clients.length);
      if (clients.length == 1) { //make dj
        socket.emit('setDJ');
      } else { //TODO: grab current track
        if (currentTracks[roomName])
          socket.emit('djPlayedTrack', currentTracks[roomName]);
      }
      if (chat[roomName])
        socket.emit('loadChat', chat[roomName]);


    });

    socket.on('playTrack', function(trackKey) {
      socket.get('room', function(error, roomName) {
        console.log("current track for room: "+trackKey);
        currentTracks[roomName] = trackKey;
        socket.broadcast.to(roomName).emit('djPlayedTrack', trackKey);
      });
    });

    socket.on('sendMessage', function(name, message) {
      socket.get('room', function(error, roomName) {
        if (!chat[roomName])
          chat[roomName] = [];
        chat[roomName].push({ name: name, message: message });
        console.log(chat);
        socket.broadcast.to(roomName).emit('messageReceived', name, message);
      });
    });
  });
  io.sockets.on('disconnect', function(socket) {
      
  });
};

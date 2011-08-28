module.exports = function(app, rdio, host) {

  var io = require('socket.io').listen(app);

  io.sockets.on('connection', function(socket) {

    socket.on('join', function(roomName) {
      console.log("user joined room: "+roomName);
      socket.join(roomName);
      var clients = io.sockets.clients(roomName);
      console.log("users in room "+roomName+": "+clients.length);
      if (clients.length == 1) { //make dj
        socket.emit('setDJ');
      } else if (room.currentTrack) {
        socket.broadcast.in(roomName).emit('djPlayedTrack', room.currentTrack);
      }

    });

    socket.on('playTrack', function(roomName, trackKey) {
      console.log("current track for room: "+trackKey);
      socket.in(roomName).set('currentTrack', trackKey);
      socket.broadcast.in(data.roomName).emit('djPlayedTrack', trackKey);
    });

    socket.on('chatMessage', function(roomName, name, message) {
      socket.broadcast.in(roomName).emit('chatMessage', name, message);
    });
  });
  io.sockets.on('disconnect', function(socket) {
      
  });
};

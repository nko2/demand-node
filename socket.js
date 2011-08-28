var services = require('./services.js')();

module.exports = function(app, rooms, rdio, host) {

  var io = require('socket.io').listen(app);

  io.sockets.on('connection', function(socket) {


    socket.on('join', function(roomName, firstName) {
      console.log("user joined room: "+roomName);
      socket.join(roomName);
      socket.set('room', roomName);
      socket.set('name', firstName);
      var clients = io.sockets.clients(roomName);
      console.log("users in room "+roomName+": "+clients.length);

      var room = rooms.get(roomName);
      room.users[socket.id] = firstName;
      room.userCount++;

      if (clients.length == 1) { //make dj
        socket.emit('setDJ');
      } else { 
        if (room.currentTrack)
          socket.emit('djPlayedTrack', room.currentTrack);
        socket.broadcast.to(roomName).emit('userJoin', socket.id, firstName);
        socket.emit('loadUsers', room.users);
      }
      if (room.chatMessages)
        socket.emit('loadChat', room.chatMessages);

    });

    socket.on('playTrack', function(trackKey) {
      socket.get('room', function(error, roomName) {
        var room = rooms.get(roomName);
        room.currentTrack = trackKey;
        console.log("current track for room: "+trackKey);
        socket.broadcast.to(roomName).emit('djPlayedTrack', trackKey);
      });
    });

    socket.on('placeBid', function(bidAmount, roomName, user_id) {
      socket.get('room', function(error, roomName) {
        var room = rooms.get(roomName);
        room.bidTotal += bidAmount;

        console.log("current bid total for room: "+room.bidTotal);
        socket.broadcast.to(roomName).emit('bidPlaced', room.bidTotal);


      });
    });

    socket.on('sendMessage', function(name, message) {
      socket.get('room', function(error, roomName) {
        var room = rooms.get(roomName);
        room.chatMessages.push({ name: name, message: message });
        socket.broadcast.to(roomName).emit('messageReceived', name, message);
      });
    });
    socket.on('disconnect', function() {
      console.log("disconnect");
      socket.get('room', function(err, roomName) {
        if (roomName) {
          console.log("user left room: "+roomName);
          var room = rooms.get(roomName); 
          delete room.users[socket.id];
          room.userCount--;
          socket.broadcast.to(roomName).emit('userLeave', socket.id);
        }
      });
    });
  });
};

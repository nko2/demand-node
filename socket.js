module.exports = function(app, rdio, host) {

  var io = require('socket.io').listen(app);
  var _rooms = {};
  var getRoom = function(roomName) {
    if (!_rooms[roomName]) {
      _rooms[roomName] = {
        chatMessages: [],
        users: {},
        currentTrack: ''
      };
    }
    return _rooms[roomName];
  };

  io.sockets.on('connection', function(socket) {


    socket.on('join', function(roomName, firstName) {
      console.log("user joined room: "+roomName);
      socket.join(roomName);
      socket.set('room', roomName);
      socket.set('name', firstName);
      var clients = io.sockets.clients(roomName);
      console.log("users in room "+roomName+": "+clients.length);

      var room = getRoom(roomName);
      room.users[socket.id] = firstName;

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
        var room = getRoom(roomName);
        room.currentTrack = trackKey;
        console.log("current track for room: "+trackKey);
        socket.broadcast.to(roomName).emit('djPlayedTrack', trackKey);
      });
    });

    socket.on('sendMessage', function(name, message) {
      socket.get('room', function(error, roomName) {
        var room = getRoom(roomName);
        room.chatMessages.push({ name: name, message: message });
        socket.broadcast.to(roomName).emit('messageReceived', name, message);
      });
    });
    socket.on('disconnect', function() {
      console.log("disconnect");
      socket.get('room', function(err, roomName) {
        console.log("user left room: "+roomName);
        var room = getRoom(roomName); 
        delete room.users[socket.id];
        socket.broadcast.to(roomName).emit('userLeave', socket.id);
      });
    });
  });
};

var services = require('./services.js')();

module.exports = function(app, rooms, rdio, host) {

  var io = require('socket.io').listen(app);

  io.sockets.on('connection', function(socket) {


    socket.on('join', function(roomName, firstName, userId) {
      console.log("user joined room: "+roomName);
      socket.join(roomName);
      socket.set('room', roomName);
      socket.set('name', firstName);
      socket.set('userId', userId);
      var clients = io.sockets.clients(roomName);
      console.log("users in room "+roomName+": "+clients.length);

      var room = rooms.get(roomName);
      room.users[socket.id] = firstName;
      room.userCount++;
      if (!userId)
        room.guestCount++;

      if (room.currentTrack)
        socket.emit('djPlayedTrack', room.currentTrack);
      socket.broadcast.to(roomName).emit('userJoin', socket.id, firstName);
      socket.emit('loadUsers', room.users);

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

    socket.on('placeBid', function(bidAmount) {
      socket.get('room', function(error, roomName) {
        socket.get('userId', function(error, userId) {

          var room = rooms.get(roomName);

          if(userId in room.bids) return false; //double bidding D:

          room.bidTotal = parseInt(room.bidTotal)+parseInt(bidAmount);
          room.usersBid++;

          console.log("current bid total for room: "+room.bidTotal);
          socket.to(roomName).emit('bidPlaced', room.bidTotal);

          room.bids[userId] = bidAmount;

          //TODO: check if all users bid, if true, setDJ
          if (room.usersBid >= (room.userCount - room.guestCount)/2) {
            setDJ();
          }
        });

      });
    });

    var setDJ = function() {
      socket.get('room', function(error, roomName) {
        var room = rooms.get(roomName);
        
        socket.to(roomName).emit('unsetDJ');
        socket.to(roomName).emit('resetBid');

        var topBidAmount = 0,
            topBidUser = '';

        for(var bid in room.bids) {
          if(room.bids[bid] > topBidAmount) {
            topBidAmount = room.bids[bid];
            topBidUser = bid;
          }
        }

        room.currentDJ = topBidUser;
        socket.emit('setDJ', topBidUser);

        room.bidTotal = 0;
        room.usersBid = 0;
        room.bids = {};

      });
    };

    socket.on('songEnded', function() {
      setDJ();
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
        socket.get('userId', function(err, userId) {
          if (roomName) {
            console.log("user left room: "+roomName);
            var room = rooms.get(roomName); 
            delete room.users[socket.id];
            room.userCount--;
            if (!userId)
              room.guestCount--;
            socket.broadcast.to(roomName).emit('userLeave', socket.id);
          }
        });
      });
    });
  });
};

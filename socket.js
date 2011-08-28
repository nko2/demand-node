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

      room.points[socket.id] = 100;

      if (room.currentTrack)
        socket.emit('djPlayedTrack', room.currentTrack);
      socket.broadcast.to(roomName).emit('userJoin', socket.id, firstName);
      socket.emit('loadUsers', room.users);

      if (room.chatMessages)
        socket.emit('loadChat', room.chatMessages);


      for(var i = clients.length; i--;) {
        var client = clients[i];
        console.log(client.id);
        client.emit('updatePoints', room.points[client.id]);
      }

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

          var clients = io.sockets.clients(roomName);

          if(userId in room.bids) return false; //double bidding D:

          if(room.points[socket.id] < bidAmount) bidAmount = room.points[socket.id];

          room.points[socket.id] -= bidAmount;

          for(var i = clients.length; i--;) {
            var client = clients[i];
            console.log(client.id)
            client.emit('updatePoints', room.points[client.id]);
          }

          room.bidTotal = parseInt(room.bidTotal)+parseInt(bidAmount);
          room.usersBid++;

          console.log("current bid total for room: "+room.bidTotal);
          socket.broadcast.to(roomName).emit('bidPlaced', room.bidTotal);

          room.bids[userId] = bidAmount;

          if (!room.currentTrack) {
            var userStreamCount = (room.userCount - room.guestCount);
            if (userStreamCount <= 2) {//if only two users, both need to bid
              if (userStreamCount == room.usersBid)                 
                setDJ();
            } else if (room.usersBid >= userStreamCount/2) {
              setDJ();
            }
          }
        });

      });
    });

    var setDJ = function() {
      socket.get('room', function(error, roomName) {
        var room = rooms.get(roomName);
        
        //socket.broadcast.to(roomName).emit('unsetDJ');
        socket.emit('unsetDJ');
        socket.broadcast.to(roomName).emit('resetBid');
        socket.emit('resetBid');

        var topBidAmount = -1,
            topBidUser = '';

        console.log(room.bids);
        for(var bid in room.bids) {
          if(room.bids[bid] > topBidAmount) {
            topBidAmount = room.bids[bid];
            topBidUser = bid;
          }
        }

        room.currentDJ = topBidUser;
        room.wonBid = topBidAmount;
        console.log(topBidUser);
        socket.broadcast.to(roomName).emit('setDJ', topBidUser);
        console.log("set dj "+topBidUser);
        //socket.emit('setDJ', topBidUser);

        room.bidTotal = 0;
        room.usersBid = 0;
        room.bids = {};

      });
    };

    socket.on('songEnded', function() {
      socket.get('room', function(error, roomName) {
        var clients = io.sockets.clients(roomName);
        var room = rooms.get(roomName);
        room.currentTrack = null;
        room.points[socket.id] += (room.wonBid !== 0) ? (room.wonBid*2)-10 : 0;

        console.log('song end, awarding cake')

        setDJ();

        for(var i = clients.length; i--;) {
          var client = clients[i];
          room.points[client.id] += 10;
          client.emit('updatePoints', room.points[client.id]);
        }
      });
    });

    socket.on('vote', function(direction) {
      socket.get('room', function(error, roomName) {
        var room = rooms.get(roomName);
        var clients = io.sockets.clients(roomName);
        
        room.score += direction;

        var negativeThreshold = ~((client.length/2)-1);
        if(negativeThreshold > 0) negativeThreshold = 0;
        if(room.score <= negativeThreshold) {
          //kick them out!
          setDJ();
          room.points[room.currentDJ] -= 10;
          for(var i = clients.length; i--;) {
            var client = clients[i];
            room.points[client.id] += 10;
            client.emit('updatePoints', room.points[client.id]);
          }
        }

        socket.to(roomName).emit('updateVotes', room.score);
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

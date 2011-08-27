var nowjs = require('now');

module.exports = function(app, rdio, host) {
  var everyone = nowjs.initialize(app);
  var rooms = [];
  everyone.now.newRoom = function(roomName) {
    rooms.push(name);
  };
  everyone.now.joinRoom = function(roomName) {
    var self = this;
    var room = nowjs.getGroup(roomName);
    console.log("user joined room: "+roomName);
    room.addUser(this.user.clientId);
    room.count(function(c) {
      console.log("Users in room: "+c);
      if (c === 1) { // first in room
        setTimeout(function() { //TODO: fixme
          //console.log(self.user);
          //self.user.now.setDJ();
          room.now.setDJ(); //TODO: need to be able to pass to specific user
        }, 1000);
      } else {
        if (room.now.currentTrack) {
          console.log("current track for room: "+room.now.currentTrack);
          setTimeout(function() { //TODO: another nasty hack
            room.now.djPlayedTrack(room.now.currentTrack);
          }, 2000);
        }
      }
    });
  };
  everyone.now.playTrack = function(roomName, trackId) {
    var room = nowjs.getGroup(roomName);
    console.log(roomName+" dj played: "+trackId);
    room.now.currentTrack = trackId;
    room.now.djPlayedTrack(trackId);
  };
};

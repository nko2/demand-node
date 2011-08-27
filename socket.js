var nowjs = require('now');

module.exports = function(app, rdio, host) {
  var everyone = nowjs.initialize(app);
  var rooms = [];
  everyone.now.newRoom = function(roomName) {
    rooms.push(name);
  };
  everyone.now.joinRoom = function(roomName) {
    var room = nowjs.getGroup(roomName);
    console.log("user joined room: "+roomName);
    room.addUser(this.user.clientId);
    console.log("current track for room: "+room.now.currentTrack);
    if (room.now.currentTrack) {
      console.log("passed track");
      setTimeout(function() { //TODO: another nasty hack
        room.now.djPlayedTrack(room.now.currentTrack);
      }, 2000);
    }
    room.getUsers(function(users) {
      console.log(users);
    });
  };
  everyone.now.playTrack = function(roomName, trackId) {
    var room = nowjs.getGroup(roomName);
    console.log(roomName+" dj played: "+trackId);
    room.now.currentTrack = trackId;
    room.now.djPlayedTrack(trackId);
  };
};

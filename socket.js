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
    room.getUsers(function(users) {
      console.log(users);
    });
  };
  everyone.now.playTrack = function(roomName, trackId) {
    var room = nowjs.getGroup(roomName);
    console.log(roomName+" dj played: "+trackId);
    room.now.djPlayedTrack(trackId);
  };
};

var Rooms = function() {
	this._data = {};
};
Rooms.prototype.create = function() {
	return {
		chatMessages: [],
		users: {},
		currentTrack: ''
	};
};
Rooms.prototype.get = function(roomName) {
  if (!this._data[roomName]) {
		  this._data[roomName] = this.create();
  }
  return this._data[roomName];
};

module.exports = Rooms;

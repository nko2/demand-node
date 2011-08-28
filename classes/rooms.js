var Rooms = function() {
	this._data = {};
	this._count = 0;
	this.get('Free For All');
};
Rooms.prototype.makeSlug = function(str) {
	if (str) {
		str = str.toLowerCase();
		str = str.replace(/[^a-z0-9]+/g, '-');
		str = str.replace(/^-|-$/g, '');
	}
	return str;
};
Rooms.prototype.create = function(roomName, slug) {
	return {
		name: roomName,
		slug: slug,
		chatMessages: [],
		users: {},
		userCount: 0,
		guestCount: 0,
		currentTrack: '',
		bidTotal: 0,
		bids: {},
		usersBid: 0,
		currentDJ: '',
		points: {}
	};
};
Rooms.prototype.getFromSlug = function(slug) {
	return this._data[slug];
};
Rooms.prototype.get = function(roomName) {
	var slug = this.makeSlug(roomName);
  if (!this._data[slug]) {
		  this._data[slug] = this.create(roomName, slug);
			this._count++;
  }
  return this._data[slug];
};

Rooms.prototype.all = function() {
	return this._data;
};

Rooms.prototype.count = function() {
	return this._count;
};

module.exports = Rooms;

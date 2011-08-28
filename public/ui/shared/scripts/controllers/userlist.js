var UserListController = Fidel.ViewController.extend({
	init: function() {
		this.socket.on('loadUsers', this.proxy(this.loadUsers));
		this.socket.on('userJoin', this.proxy(this.onUserJoin));
		this.socket.on('userLeave', this.proxy(this.onUserLeave));
		this.onUserJoin(-1, window.firstName);
	},
	format: function(socketId, name) {
		return '<li class="user" data-socketid="'+socketId+'">'+name+'</li>';
	},
	loadUsers: function(data) {
		// console.log('load users', data);
		var html = [];
		for (var socketId in data) {
			html.push(this.format(socketId, data[socketId]));
		}
		this.find('ul').find('.user').remove();
		this.find('ul').append(html.join(''));
	},
	onUserJoin: function(socketId, name) {
		this.find('ul').append(this.format(socketId, name));
	},
	onUserLeave: function(socketId) {
		this.find('[data-socketid="'+socketId+'"]').remove();
	}
});

var ChatController = Fidel.ViewController.extend({
	init: function() {
		this.socket.on('messageReceived', this.proxy(this.onMessageReceived));
		this.socket.on('loadChat', this.proxy(this.loadChat));
	},
	formatMessage: function(name, message) {
		return '<li><span>'+name+'</span>'+message+'</li>';
	},
	loadChat: function(data) {
		console.log('load chat', data);
		var html = [];
		for (var i = 0, c = data.length; i < c; i++) {
			var msg = data[i];
			html.push(this.formatMessage(msg.name, msg.message));
		}
		this.find('ul').html(html.join(''));
	},
	sendMessage: function() {
		var txt = this.chatBox.val();
		this.socket.emit('sendMessage', window.firstName, txt);
		this.chatBox.val('');
		this.onMessageReceived(window.firstName, txt);
	},
	onMessageReceived: function(name, message) {
		console.log("new chat message", message);
		this.find('ul').append(this.formatMessage(name, message));
	}
});

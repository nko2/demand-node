var RoomsController = Fidel.ViewController.extend({
	init: function() {
	},
	create: function() {
		var val = this.createBox.val();
		if (val)
			window.location = '/create?name='+val;
	}
});


new RoomsController({ el: $('#content') });

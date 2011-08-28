var RoomsController = Fidel.ViewController.extend({
  events: {
    keystroke: 'keyup .create input'
  },
	init: function() {
	},
	keystroke: function(e){
		var self = this;
    if (e.keyCode == 13) {
    	self.create();
    }
	},
	create: function() {
		var val = this.createBox.val();
		if (val)
			window.location = '/create?name='+val;
	}
});


new RoomsController({ el: $('#content') });

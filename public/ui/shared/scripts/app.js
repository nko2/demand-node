var AppController = Fidel.extend({
	init: function() { 
		var self = this;
		this.plaxController = new PlaxController ({ el: $('#crowd') });
	}
});
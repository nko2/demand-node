var PlaxController = Fidel.ViewController.extend ({
	init: function() {
		$('.shallow').plaxify({"xRange":200,"yRange":10});
		$('.deep').plaxify({"xRange":15,"yRange":0});
		$.plax.enable();
	}
});

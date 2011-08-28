var SearchController = Fidel.ViewController.extend ({
  events: {
    keystroke: 'keyup #search input',
    hide: 'click #search #hide'
  },
	init: function() {
		console.log('fired search cont');
	},
	keystroke: function(e){
		console.log('fired stroke');
		var self = this,
				query = $('#search input').val();
    if (e.keyCode == 13) {
    	services.rdio.search(query, function(data){
    		self.results(data);
    	});
    }
	},
	results: function(data){
		console.log(data, 'results');
		var results = data.results;
		for(i = 0, c = results.length; i < c; i++){
			$('#search #results').append('<li data-trackkey='+ results[i].key +'>' + results[i].name + '</li>');
		}
		$('#search #results').append('<li id="hide">Hide Results</li>');
	},
	hide: function(){
		$('#search #results li').remove();
	}
});
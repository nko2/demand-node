var SearchController = Fidel.ViewController.extend ({
  events: {
    keystroke: 'keyup input',
    hide: 'click .hide',
    select: 'click .song' 
  },
  init: function() { },
  keystroke: function(e){
    var self = this,
        query = this.searchBox.val();
    if (e.keyCode == 13) {
      console.log('searching')
      services.rdio.search(query, function(data){
        self.results(data);
      });
    }
  },
  results: function(data){
    var results = data.results;
    this.resultsNode.html('');
    console.log(data);
    if(results.length == 0) {
        this.resultsNode.append('<li><span>Sorry, brah. Stairway to heaven is nigh. Please find another track.</span></li>')
    } else {
      for(i = 0, c = results.length; i < c; i++){
        if (results[i].canStream) {
          this.resultsNode.append('<li class="song" data-trackkey='+ results[i].key +'>' + results[i].artist + ' - ' + results[i].name + ' ('+ results[i].album+')</li>');
        }
      } 
      this.resultsNode.append('<li class="hide">Hide Results</li>');
    }
  },
  select: function(e) {
    var trackKey = e.target.getAttribute('data-trackkey');
    this.emit('select', [trackKey]);
    this.searchBox.val('');
    this.hide();
  },
  hide: function(){
    this.resultsNode.find('li').remove();
  }
});

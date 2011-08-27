var RoomController = Fidel.ViewController.extend({
  events: {
    playTrackAction: 'click ul li' //delegateActions won't work here - bug in fidel
  },
  init: function() {
    var self = this;
    this.isDJ = false;
    this.room = window.room; //TODO
    this._playerReady = false;
    this.player = new Player(this.playbackToken);
    this.player.on('ready', this.proxy(this.onPlayerReady));

    now.ready(this.proxy(this.onNowReady()));
  },
  onNowReady: function() {
    console.log("now ready");
    var self = this;
    setTimeout(function() { //TODO: nowjs blows - need to look into this
      console.log("joined room: "+window.room);
      now.joinRoom(window.room);
      now.djPlayedTrack = self.proxy(self.djPlayedTrack); 
      now.setDJ = self.proxy(self.setDJ);
    }, 2000);
  },
  onPlayerReady: function() {
    this._playerReady = true;
  },
  djPlayedTrack: function(trackKey) {
    if (!this.isDJ) {
      console.log("dj played track", trackKey);
      this.player.play(trackKey);
    }
  },
  setDJ: function() {
    console.log("set as DJ");
    this.isDJ = true;
    this.showDJ();
  },
  showDJ: function() {
    var self = this;
    services.rdio.getTopCharts(function(data) { //TODO: tmp just to get something working
      console.log(data);
      var tmp = $("#tmpDJ").html();
      var html = str.template(tmp, { tracks: data });
      self.find("#dj").html(html);
      self.delegateActions();
    });
  },
  playTrackAction: function(e) {
    var trackKey = e.target.getAttribute('data-trackkey');
    console.log(trackKey);
    this.playTrack(trackKey);
  },
  playTrack: function(trackKey) {
    var self = this;
    this.player.play(trackKey);
    now.playTrack(this.room, trackKey);
    services.rdio.getTrackInfo(trackKey, function(data) {
      console.log(data);
      var tmp = $("#tmpNowPlaying").html();
      var html = str.template(tmp, { track: data });
      self.find("#nowPlaying").html(html);
    });
  }
});

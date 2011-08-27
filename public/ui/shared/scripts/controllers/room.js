var RoomController = Fidel.ViewController.extend({
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
  playButton: function() { //only if dj
    this.isDJ = true; //TODO: set somewhere else
    if (this._playerReady && this.isDJ) {
      this.player.play(trackId);
      now.playTrack(this.room, trackId);
    }
  },
  djPlayedTrack: function(trackId) {
    if (!this.isDJ) {
      console.log("dj played track: "+trackId);
      this.player.play(trackId);
    }
  },
  setDJ: function() {
    console.log("set as DJ");
    this.isDJ = true;
    this.showDJ();
  },
  showDJ: function() {
    var tmp = $("#tmpDJ").html();
    var html = str.template(tmp, {});
    this.find("#dj").html(html);
    this.delegateActions();
  }
});

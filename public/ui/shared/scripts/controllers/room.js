var RoomController = Fidel.ViewController.extend({
  init: function() {
    var self = this;
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
      now.djPlayedTrack = function(trackId) {
        console.log("dj played track: "+trackId);
        self.player.play(trackId);
      };
    }, 2000);
  },
  onPlayerReady: function() {
    this._playerReady = true;
  },
  play: function() { //only if dj
    if (this._playerReady) {
      this.isDJ = true;
      this.player.play(trackId);
      now.playTrack(this.room, trackId);
    }
  }
});

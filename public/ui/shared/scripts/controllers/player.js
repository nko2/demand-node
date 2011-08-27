var PlayerController = Fidel.ViewController.extend({
  init: function() {
    var self = this;
    this.playerId = "rdioPlayer";
    this._initFPlayer();
  },
  _initFPlayer: function() {
    var self = this;
    window.rdioListener = {
      ready: self.proxy(self._ready),
      playStateChanged: self.proxy(self._playStateChanged)
    };

    var flashvars = {
      playbackToken: self.playbackToken,
      domain: encodeURIComponent(document.domain),
      listener: 'rdioListener'
    };
    var params = {
      'allowScriptAccess': 'always'
    };
    swfobject.embedSWF("http://www.rdio.com/api/swf/", this.playerId, "1", "1", "9.0.0","", flashvars, params);
  },
  _initSocket: function() {
/*
    var self = this;
    this.socket = io.connect("");
    this.socket.emit('player', '', function(token) {
      console.log("token", token);
      self.token = token;
      self.trigger('ready');
    });
    this.socket.on('pause', this.proxy(this.pause));
    this.socket.on('play', this.proxy(this.play));
*/
  },
  _ready: function() {
    this.player = $("#"+this.playerId)[0];
    console.log("ready", this);
    this.trigger('ready');
    this._initSocket();
  },
  _playStateChanged: function(state) {
    console.log("state", state);
  },
  pause: function() { 
    console.log("pause");
    this.player.rdio_pause();
  },
  play: function(key) {
    console.log("play", key);
    this.player.rdio_play(key);
  }
});

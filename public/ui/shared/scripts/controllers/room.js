var RoomController = Fidel.ViewController.extend({
  init: function() {
    var self = this;
    this.player = new PlayerController({ el: this.playerNode, playbackToken: this.playbackToken });
    this.player.on('ready', this.proxy(this.onPlayerReady));
  },
  onPlayerReady: function() {
    this.player.play('t10978726');
  }
});

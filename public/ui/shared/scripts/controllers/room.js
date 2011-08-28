var RoomController = Fidel.ViewController.extend({
  events: {
    playTrackAction: 'click ol li .play', //delegateActions won't work here - bug in fidel
    placeBid: 'click button.bidSubmit'
  },
  init: function() {
    var self = this;
    this.isDJ = false;
    this._playerReady = false;
    this.player = new Player(this.playbackToken);
    this.player.on('ready', this.proxy(this.onPlayerReady));

  },
  onPlayerReady: function() {
    this._playerReady = true;
    this.initSocket();
  },
  initSocket: function() {
    this.socket = io.connect('http://'+document.location.hostname); //TODO
    this.chat = new ChatController({ el: this.find("#chat"), socket: this.socket });
    this.userList = new UserListController({ el: this.find("#userlist"), socket: this.socket });
    this.socket.on('setDJ', this.proxy(this.setDJ));
    this.socket.on('djPlayedTrack', this.proxy(this.djPlayedTrack));
    this.socket.emit('join', this.room, window.firstName);
    this.socket.on('bidPlaced', this.proxy(this.updateBid));
    this.socket.on('resetBid', this.proxy(this.resetBid));
  },
  djPlayedTrack: function(trackKey) {
    if (!this.isDJ) {
      console.log("dj played track", trackKey);
      this.playTrack(trackKey);
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
    if (this.isDJ)
      this.socket.emit('playTrack', trackKey);
    this.player.play(trackKey);
    services.rdio.getTrackInfo(trackKey, function(data) {
      console.log(data);
      var tmp = $("#tmpNowPlaying").html();
      var html = str.template(tmp, { track: data });
      self.find("#nowPlaying").html(html);
    });
  },
  placeBid: function(e) {
    e.preventDefault();
    var bidInput = $('.bidAmount')[0],
        bidAmount = bidInput.value;
    if(bidAmount < 1) return; //NOPE.AVI

    this.socket.emit('placeBid', this.room, window.user_id, bidAmount);

    bidInput.disabled = true;
    e.target.disabled = true;

    this.resetBid();
  },
  resetBid: function() {
    $('.bidAmount')[0].disabled = false;
    $('.bidSubmit')[0].disabled = false;
    $('.topBid').html('0');
  },
  updateBid: function(total) {
    $('.topBid').html(total);
  }
});

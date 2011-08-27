function changeSong() {
	//start the song
	last_state = null;
	var song = pickRandomSong();
	player.rdio_play(song.key);

	$("#song-name").html('<a href="'+song.shortUrl+'">'+song.name+'</a>');
	$("#band-name").text(song.albumArtist);
	$("#album-image").html($('<img/>').attr("src", song.icon));
}
var player;
var rdioListener = {
	ready: function() {
		player = document.getElementById("rdioPlayer");
		changeSong();
	},
	playStateChanged: function(state) {
		if(state == 0 || state == 2 || state == 4) {
			$("#ctrl-play").show();
			$("#ctrl-pause").hide();
		} else {
			$("#ctrl-play").hide();
			$("#ctrl-pause").show();
		}

		if(state == 2 && last_state !== null) {
			changeSong();
		}

		last_state = state;
	}
};
var flashvars = {
	playbackToken: playbackToken,
	domain: encodeURIComponent(document.domain),
	listener: 'rdioListener'
};
var params = {
	'allowScriptAccess': 'always'
};
swfobject.embedSWF("http://www.rdio.com/api/swf/", "rdioPlayer", "1", "1", "9.0.0","", flashvars, params);

//listeners
$("#ctrl-play").click(function(e){
	e.preventDefault();
	player.rdio_play();
	return false;
});
$("#ctrl-pause").click(function(e){
	e.preventDefault();
	player.rdio_pause();
	return false;
});
$("#next-song").click(function(e){
	e.preventDefault();
	changeSong();
	return false;
});
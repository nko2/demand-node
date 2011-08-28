var url = require('url'),
    R = require("resistance").R,
    services = require('./services.js')();

var GuestUser = { 
  firstName: 'Guest'+(~~(Math.random()*100000)),
  key: null
};

module.exports = function(app, rooms, rdio, host){

  app.get ('/oauth/login', function(req, res, params) {
    if(!req.session.oauth_access_token) {
      rdio.getRequestToken(function(error, oauth_token, oauth_token_secret, results){
        if(error) {
          throw new Error(error);
        } else { 
          // store the tokens in the session
          req.session.oauth_token = oauth_token;
          req.session.oauth_token_secret = oauth_token_secret;
          req.session.isGuest = false;

          // redirect the user to authorize the token
          res.redirect('https://www.rdio.com/oauth/authorize?oauth_token='+oauth_token);
        }
      });
    } else {
      res.redirect("/");
    }
  });

  app.get ('/oauth/callback', function(req, res, params) {
    var parsedUrl = url.parse(req.url, true);
    rdio.getAccessToken(parsedUrl.query.oauth_token, req.session.oauth_token_secret, parsedUrl.query.oauth_verifier, 
      function(error, oauth_access_token, oauth_access_token_secret, results) {
        req.session.oauth_access_token = oauth_access_token;
        req.session.oauth_access_token_secret = oauth_access_token_secret;
        res.redirect("/rooms/");
      }
    );
  });

  app.get('/guest', function(req, res) {
    req.session.isGuest = true;
    res.redirect("/");
  });

  app.get('/logout', function(req, res) {
    delete req.session.oauth_token
    delete req.session.oauth_token_secret
    delete req.session.oauth_access_token
    delete req.session.oauth_access_token_secret
    delete req.session.isGuest
    res.redirect('/')
  })

  app.get('/', function(req, res) {
    if(req.session.oauth_access_token || req.session.isGuest) {
      res.redirect("/rooms/");
    } else  {
      res.render('index', {
        title: 'Knockout Radio',
        isGuest: false,
        isHomepage: true
      });
    }
  });

  app.get('/rooms/:roomSlug', function(req, res){
    var slug = req.params.roomSlug;
    var room = rooms.getFromSlug(slug);
    if (!room) {
      res.redirect('/rooms/')
      return
    }
    if(req.session.oauth_access_token || req.session.isGuest) {

      R.parallel([
        function(cb) {
          if (req.session.isGuest) {
            cb(GuestUser);
          } else {
            rdio.api(
              req.session.oauth_access_token,
              req.session.oauth_access_token_secret,
              {
                method: 'currentUser'
              },
              function(err, data, response) {
                console.log(arguments);
                var user = JSON.parse(data).result;
                console.log(user);
                cb(user);
              }
            );
          }
        },
        function(cb) {
          rdio.getPlaybackToken(
            req.session.oauth_access_token,
            req.session.oauth_access_token_secret,
            host,
            function(err, data, response) {
              var playbackToken = JSON.parse(data).result
              cb(playbackToken);
            }
          );
        }
      ], function(data) {
        var user = data[0],
            playbackToken = data[1];

        R.series([
          function(cb) {
            services.getPoints(user.key, function(points) {
              cb(points);
            })
          }
        ], function(data) {
          var points = data[0];

          //services.adjustPoints(user.key, 1);

          console.log(points);

          res.render('main', {
            playbackToken: playbackToken,
            title: 'Knockout Radio',
            isHomepage: false,
            isGuest: req.session.isGuest,
            user: user,
            points: points,
            room: room
          });
        });
      });

    } else {
      res.redirect('/');
    }
  });

  app.get('/rooms/', function(req, res) {

    if(!req.session.oauth_access_token && req.session.isGuest == null) {
      res.redirect("/");
      return; //make sure the stuff below doesn't execute
    }

    var user;
    var render = function() {
      res.render('rooms', {
        title: 'Rooms | Knockout Radio',
        isHomepage: false,
        rooms: rooms,
        isGuest: req.session.isGuest,
        user: user
      });
    };
    if (req.session.isGuest) {
      user = GuestUser;
      render();
    } else {
      rdio.api(
        req.session.oauth_access_token,
        req.session.oauth_access_token_secret,
        { method: 'currentUser' },
        function(err, data, response) {
          var user = JSON.parse(data).result;
          render();
        }
      );
    }
  });

  app.get('/create', function(req, res) {
    var roomName = req.query.name;
    //TODO: should append a number until a unique room?
    var room = rooms.get(roomName);
    res.redirect('/rooms/'+room.slug);
  });
};

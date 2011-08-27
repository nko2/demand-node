var url = require('url');

module.exports = function(app, rdio, host){

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
        res.redirect("/");
      }
    )
  });

  app.get('/guest', function(req, res) {
    req.session.isGuest = true;
    res.redirect("/");
  });

  app.get('/logout', function(req, res) {
    req.session.oauth_token = null;
    req.session.oauth_token_secret = null;
    req.session.oauth_access_token = null;
    req.session.oauth_access_token_secret = null;
    req.session.isGuest = null;
    res.redirect('/')
  })

  app.get('/', function(req, res){

    var services = require('./services.js')();

    if(req.session.oauth_access_token || req.session.isGuest) {
      rdio.api(
        req.session.oauth_access_token,
        req.session.oauth_access_token_secret,
        {
          method: 'currentUser'
        },
        function(err, data, response) {
          var user = JSON.parse(data).result;

          console.log(user);

          rdio.getPlaybackToken(
            req.session.oauth_access_token,
            req.session.oauth_access_token_secret,
            host,
            function(err, data, response) {
              console.log(data);

              var points = services.getPoints(user.key);

              console.log(points);

              res.render('main', {
                playbackToken: JSON.parse(data).result,
                title: 'Knockout Radio',
                isGuest: req.session.isGuest,
                user: user,
                points: points
              });
            }
          );
        }
      );
    } else {
      res.render('index', {
        title: 'Knockout Radio'
      });
    }
  });
};

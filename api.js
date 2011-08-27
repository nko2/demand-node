module.exports = function(app, rdio){
  app.get ('/api/rdio/topcharts', function(req, res, params) {
    rdio.api(
      req.session.oauth_access_token,
      req.session.oauth_access_token_secret,
      {
        method: 'getTopCharts',
        type: 'Track',
        count: 10
      }, function(err, data, response) {
        var tracks = JSON.parse(data);
        res.contentType('application/json');
        res.send(tracks);
      });
  });
  app.get('/api/rdio/get', function(req, res, params) {
    var keys = req.query.keys;
    rdio.api(
      req.session.oauth_access_token,
      req.session.oauth_access_token_secret,
      {
        method: 'get',
        keys: keys
      }, function(err, data, response) {
        res.contentType('application/json');
        res.send(JSON.parse(data));
      });

  });
};

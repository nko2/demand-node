var http = require('http'),
    nko = require('nko')('0Fpe8yXwL+6WOR2s');

/*
* Module dependencies.
*/

var express = require('express'),
    app = module.exports = express.createServer();

var querystring = require('querystring'),
    RedisStore = require('connect-redis')(express);

var ui = function(req, res, next) {
  res.local("scripts", []);
  res.local("stylesheets", []);
  next();
};
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(ui);
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  //oauth setup
  //app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use( express.session( { secret: "oiwugrekudbhkjngh9843yt6", store: new RedisStore }));

  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.dynamicHelpers({
  base: function(){
    return '/' == app.route ? '' : app.route;
  },
  session: function(req, res){
    return req.session;
  }
});


// Configuration
var server_port = 80,
    server_host = 'knockout.crunchtune.com',
    api_key = 'nb7uwguu2k2ra3dy5s2qpjkr',
    api_shared = 'ns3NR8ZGVG';

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  server_port = 3002;
  server_host = 'http://dev.crunchtune.com'
  api_key = 'k7asxsy9cqsph3j9zxzmq9z8';
  api_shared = 'fGerbhySxa';
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});


//setup rdio
var rdio = require('rdio')({
  rdio_api_key: api_key, //nb7uwguu2k2ra3dy5s2qpjkr
  rdio_api_shared: api_shared,   // ns3NR8ZGVG
  callback_url: "http://"+server_host+":"+server_port+"/oauth/callback"
});

//routes
require('./routes')(app, rdio, server_host);
require('./api')(app, rdio);
require('./socket')(app, rdio, server_host);
app.listen(server_port);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

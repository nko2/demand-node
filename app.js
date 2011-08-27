var http = require('http'),
    nko = require('nko')('0Fpe8yXwL+6WOR2s');

/*
* Module dependencies.
*/

var express = require('express'),
    app = module.exports = express.createServer();

var querystring = require('querystring'),
    RedisStore = require('connect-redis')(express);

// Configuration

var server_port = 80,
    server_host = 'knockout.crunchtune.com',
    rdio_api_key = 'nb7uwguu2k2ra3dy5s2qpjkr',
    rdio_api_shared = 'ns3NR8ZGVG';

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

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  rdio_api_key = 'k7asxsy9cqsph3j9zxzmq9z8';
  rdio_api_shared = 'fGerbhySxa';
  server_host = 'dev.crunchtune.com';
  server_port = 3002;
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});


//setup rdio
var rdio = require('rdio')({
  rdio_api_key: rdio_api_key,
  rdio_api_shared: rdio_api_shared, 
  callback_url: "http://"+server_host+":"+server_port+"/oauth/callback"
});

//routes
require('./routes')(app, rdio, server_host);
require('./api')(app, rdio);
require('./socket')(app, rdio, server_host);
app.listen(server_port);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

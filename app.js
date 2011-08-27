var http = require('http'),
    nko = require('nko')('0Fpe8yXwL+6WOR2s');
/*
* Module dependencies.
*/

var express = require('express'),
app = module.exports = express.createServer();

var OAuth = require('oauth').OAuth,
  querystring = require('querystring');

// Configuration

server_port = 80;

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  server_port = 3000;
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});


//setup rdio
var rdio = require('rdio')({
  rdio_api_key: ct.config.rdio_api_key,
  rdio_api_shared: ct.config.rdio_api_shared,
  callback_url: ct.config.host+":"+ct.config.port+"/oauth/callback"
});

//routes
require('routes')(app, rdio);

app.listen(server_port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
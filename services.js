var Db = require('mongodb').Db,
  Connection = require('mongodb').Connection,
  Server = require('mongodb').Server;

module.exports = function() {

  var db = new Db('knockoutradio', new Server('staff.mongohq.com', 10002, {}), {native_parser:false});

  db.open(function(err, db) {
    console.log(db);
  });

  return {
    
  };
}
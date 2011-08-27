var Db = require('mongodb').Db,
  Connection = require('mongodb').Connection,
  Server = require('mongodb').Server;

module.exports = function() {

  var self = this;

  var db = new Db('knockoutradio', new Server('staff.mongohq.com', 10002, {auto_reconnect: true}), {native_parser:false});

  db.open(function(err, db) {
    db.authenticate('demandnode', 'demandNode2011', function(err) {
      if(err) console.log(err);
    });
  });

  return {
    getPoints: function(user_id) {
      db.collection('points', function(err, col) {
        if(err) console.log(err);
        
        var cursor = col.find({
          user_id: user_id
        })
      });
    }
  };
}
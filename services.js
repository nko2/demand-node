var Db = require('mongodb').Db,
  Connection = require('mongodb').Connection,
  Server = require('mongodb').Server;

module.exports = function() {

  var isAuthed = false;

  var db = new Db('knockoutradio', new Server('staff.mongohq.com', 10002, {auto_reconnect: true}), {native_parser:false});

  function auth(cb){
    if(isAuthed) {
      cb();
      return;
    }
    db.open(function(err, db) {
      db.authenticate('demandnode', 'demandNode2011', cb);
      isAuthed = true;
    });
  }

  return {
    getPoints: function(user_id, cb) {
      var self = this;
      auth( function() {
        db.collection('points', function(err, col) {
          if(err) console.log(err);
          
          var cursor = col.find({
            user_id: user_id
          });

          cursor.toArray(function(err, docs) {
            if(docs.length == 0 || docs[0].points <= 0) {
              self.adjustPoints(user_id, 100);
              cb(100);
            } else {
              cb(docs[0].points);
            }
          });
        })
      })
    },

    adjustPoints: function(user_id, points, cb) {
      if(typeof cb !== "function") var cb = function(){};
      auth(function(){
        db.collection('points', function(err, col) {
          if(err) console.log(err);

          col.update({
              user_id: user_id
            }, {
              $inc: {
                points: points
              }
            }, {upsert: true}, cb);
        })
      })
    }
  };
}
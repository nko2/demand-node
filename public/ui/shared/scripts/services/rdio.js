var services = services || {};

services.rdio = function() {

  var makeRequest = function(method, cb) {
    reqwest({
      url: '/api/rdio/'+method,
      type: 'json',
      success: function(response) {
        if (response.status == "ok") {
          cb(response.result);
        }
      }
    });
  };
  return {
    getTopCharts: function(callback) {
      makeRequest("topcharts", callback);
    },
    getTrackInfo: function(key, callback) {
      makeRequest('get?keys='+key, function(result) {
        callback(result[key]);
      });
    }
  };
}();

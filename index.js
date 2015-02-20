var fs = require('fs');
var md5 = require('MD5');
var yesno = require('yesno');
var async = require('async');

var files = fs.readdirSync('./m');
var did = {};
var count = {};
var errors = 0;

var processFile = function(n, callback) {
  var contents = JSON.parse(fs.readFileSync('./m/' + n).toString());
  var msg = [];
  JSON.parse(contents.message).forEach(function(m) {
    msg.push(m);
  });
  var output = msg.join('\n');
  var id = md5(msg[0]);
  count[id] = count[id] || 0;
  count[id]++;
  if (did[id]) {
    callback();
    return;
  }
  did[id] = output;
  errors++;
  callback();
}
function makeSerieFunction(item, c) {
  return function(callback) {
    console.log(item)
    console.log('Error message repeated %d times', c);
    yesno.ask('Continue?', true, function(ok) {
      if (!ok) {
        return process.exit(0);
      }
      callback();
    });
  }
}
async.map(files, processFile, function(err) {
  var serie = [];
  for (var prop in did) {
    var item = did[prop];
    var c = count[prop];
    serie.push(makeSerieFunction(item, c));
  }
  async.series(serie, function() {
    console.log('Total errors: ' + errors);
    process.exit(0);
  });
});

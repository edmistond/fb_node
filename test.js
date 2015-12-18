var Feedbin = require('./index');
var _ = require('lodash');
var async = require('async');

var fb = new Feedbin('edmistond', 'pass', 'http://localhost:3002', function() {
  var subs = fb.getSubcriptionsForTag('mac-tech');
  _.forEach(subs, function(s) {
    console.log(s.id, s.title);
  });

  console.log('getting untagged subs\n\n');
  var untagged = fb.getSubcriptionsForTag('');
  _.forEach(untagged, function(s) {
    console.log(s.id, s.title);
  });
  console.log('\n');
});

var Feedbin = require('./index');
var _ = require('lodash');
var async = require('async');

var readyFunc = function() {
  // console.log(fb.getSubcriptionsForTag('mac-tech').length);
  // console.log(fb.getSubcriptionsForTag());

  _.forEach(fb.tagNames, function(t) {
    console.log('current tag:', t);
    _.forEach(fb.getSubcriptionsForTag(t), function(sub) {
      console.log("\t", sub.title, sub.tags);
    });
    console.log("\n\n");
  });
};

var fb = new Feedbin('edmistond', 'pass', 'http://localhost:3002', readyFunc);

var request = require('request');
var _ = require('lodash');
var async = require('async');

var Feedbin = function(un, pw, url, ready) {
  var self = this;
  console.log('received username: ' + un + ' and password: ' + pw);
  self.username = un;
  self.password = pw;
  self.apiBaseUrl = url;

  self.allSubs = [];
  self.allTags = [];
  self.tagNames = [];

  self.init = function(ready) {
    async.series({
      subs: getSubscriptions,
      tags: getTags
    }, function(err, results) {
      self.allSubs = results.subs;
      self.allTags = results.tags.tags;
      self.tagNames = results.tags.tagNames;

      mergeSubsAndTags();

      ready();
    });
  };

  self.getSingleSubByAttributeObject = function(attrib) {
    return _.chain(self.allSubs)
      .filter(attrib)
      .first()
      .value();
  };

  self.getSubcriptionsForTag = function(tag) {
    return _.select(self.allSubs, function(sub) {
      if (_.isEmpty(tag))
        return _.isEmpty(sub.tags);
      else
        return _.includes(sub.tags, tag);
    });
  };

  var mergeSubsAndTags = function() {
    _.forEach(self.allSubs, function(sub, index) {
      self.allSubs[index].tags = _.chain(self.allTags)
        .filter({
          feed_id: sub.feed_id
        })
        .pluck('name')
        .value();
    });
  };

  var getSubscriptions = function(callback) {
    request(self.apiBaseUrl + '/subscriptions.json', function(err, res, body) {
      if (!err && res.statusCode === 200) {
        var subs = JSON.parse(body);
        callback(null, subs);
      } else {
        callback(err, null);
      }
    });
  };

  var getTags = function(callback) {
    request(self.apiBaseUrl + '/taggings.json', function(err, res, body) {
      if (!err && res.statusCode === 200) {
        var tags = JSON.parse(body);
        var tagNames = _.chain(tags)
          .uniq(false, 'name')
          .pluck('name')
          .value();

        var result = {
          tags: tags,
          tagNames: tagNames
        };

        callback(null, result);
      } else {
        callback(err, null);
      }
    });
  };

  self.init(ready);
};

module.exports = Feedbin;

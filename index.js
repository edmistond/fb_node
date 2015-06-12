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
      if (_.isEmpty(tag)) {
        return _.isEmpty(sub.tags);
      }
      else {
        return _.includes(sub.tags, tag);
      }
    });
  };

  // disabling jscs casing rule since we're working with the raw feedbin
  // object
  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
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
  // jscs:enable requireCamelCaseOrUpperCaseIdentifiers

  var getSubscriptions = function(callback) {
    makeRequest('subscriptions.json', function(err, res) {
      if (err !== null) {
        callback(err, null);
      }
      var subs = JSON.parse(res);
      callback(null, subs);
    });
  };

  var makeRequest = function(url, callback) {
    request(self.apiBaseUrl + '/' + url, function(err, res, body) {
      if (!err && res.statusCode === 200) {
        callback(null, body);
      }
      else {
        callback(err, null);
      }
    });
  };

  var postRequest = function(url, payload, callback) {
    payload.uri = self.apiBaseUrl + '/' + url;
    request(payload, function(err, res, body) {
      if (res.statusCode === 404) {
        callback({
          status: res.statusCode,
          msg: 'not found'
        }, null);
      }
      else if (res.statusCode === 200 || res.statusCode === 204) {
        callback(null, res);
      }
      else {
        callback({
          status: res.statusCode,
          msg: err
        }, null);
      }
    });
  };

  self.deleteSubscription = function(id, callback) {
    postRequest('subscriptions/' + id + '.json', {
      method: 'DELETE',
      timeout: 10000,
      followRedirect: true,
      maxRedirects: 10
    }, function(err, res) {
      if (err !== null) {
        callback(err, null);
      }
      callback(null, id + ' deleted.');
    });
  };

  var getTags = function(callback) {
    makeRequest('taggings.json', function(err, res) {
      if (err !== null) {
        callback(err, null);
      }
      var tags = JSON.parse(res);
      var tagNames = _.chain(tags)
        .uniq(false, 'name')
        .pluck('name')
        .value();

      tagNames.push('');
      var result = {
        tags: tags,
        tagNames: tagNames
      };
      callback(null, result);
    });
  };

  self.init(ready);
};

module.exports = Feedbin;

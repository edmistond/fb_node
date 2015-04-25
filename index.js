var request = require('request');
var _ = require('lodash');
var apiUrl = 'http://localhost:3002/';

function Feedbin(username, password) {
  this.username = username;
  this.password = password;
}

Feedbin.prototype.subscriptions = function() {};

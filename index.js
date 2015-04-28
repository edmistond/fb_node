var request = require('request');
var _ = require('lodash');
var apiUrl = 'http://localhost:3002/';

function Feedbin(username, password) {
    console.log('received username {username} and password ${password}');
    this.username = username;
    this.password = password;
}

Feedbin.prototype.subscriptions = function(callback) {
    request('http://localhost:3002/subscriptions.json/', function(err, res, body) {
        if (!err && response.statusCode === 200) {
            callback(null, body);
        } else {
            callback(err, null);
        }
    });
};

module.exports = Feedbin;

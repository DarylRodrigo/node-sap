'use strict';

var request = require('request');
var Promise = require('es6-promise').Promise;
var NodeCache = require('node-cache');

function AuthService(credentials) {
  if (!credentials) {
    throw new Error('SAP - Please provide credentials.');
  } else if (
    !credentials.client_id ||
    !credentials.client_secret ||
    !credentials.refresh_token
  ) {
    throw new Error('SAP - Insufficient credentials.');
  } else {
    this.credentials = credentials;
  }

  this.cache = new NodeCache(60 * 60);
  this.isGettingAccessTokenFlag = false;
}

AuthService.prototype.accessToken = function () {
  var that = this;

  return new Promise(function(resolve, reject) {
    if (!that.isGettingAccessTokenFlag) {
      that.getAccessToken(that.credentials, function(err, accessToken) {
        if (err) reject(err);
        else resolve(accessToken);
      });
    } else {
      setTimeout(function() {
        that.getAccessToken(that.credentials, function(err, accessToken) {
          if (err) reject(err);
          else resolve(accessToken);
        });
      }, 1000);
    }
  });
}

AuthService.prototype.getAccessToken = function (credentials, cb) {
  var that = this;

  if (!that.cache.get('accessToken')) {
    that.isGettingAccessTokenFlag = true;

    getAccessTokenFromSAP(credentials)
      .then(function (tokenData) {
        that.isGettingAccessTokenFlag = false;

        that.cache.set(
          'accessToken',
          tokenData.access_token,
          tokenData.expires_in / 2
        );

        cb(null, tokenData.access_token);
      })
      .catch(function(err) {
        return cb(err);
      });
  } else {
    that.cache.get('accessToken', function (err, accessToken) {
      cb(err, accessToken);
    });
  }
}

function getAccessTokenFromSAP(credentials) {
  var options = {
    method: 'POST',
    url: 'https://my-eu.sapanywhere.com:443/oauth2/token' +
      '?client_id=' + credentials.client_id +
      '&client_secret=' + credentials.client_secret +
      '&grant_type=refresh_token&refresh_token=' + credentials.refresh_token,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  };

  return new Promise(function(resolve, reject) {
    request(options, function (err, res, body) {
      var data;

      if (body) { data = JSON.parse(body); }

      if (err) reject(err);
      else if (!err && data.error) reject(new Error(data.error_description));
      else resolve(data);
    });
  });
}

module.exports = AuthService;

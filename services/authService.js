'use strict';

var request = require('request');
var Promise = require('es6-promise').Promise;

function AuthService(credentials) {
  if (!credentials) {
    throw new Error('SAP - Please provide credentials.');
  } else if (!credentials.client_id || !credentials.client_secret || !credentials.refresh_token) {
    throw new Error('SAP - Insufficient credentials.');
  } else {
    this.credentials = credentials;
  }

  this.scheduleTokenRenewal(0);
}

AuthService.prototype.scheduleTokenRenewal = function(delay) {
  var that = this;

  setTimeout(function() {
    that.tokenPromise = tokenPromiseInit(that.credentials)

    that.tokenPromise
      .then(function (tokenData) {
        that.tokenExpiry = Math.round((tokenData.expires_in * 1000) / 2);
        that.scheduleTokenRenewal(that.tokenExpriy);
      })
      .catch(function (error) {
        console.log('SAP - Error while authenticating: ' + JSON.stringify(error));
        that.scheduleTokenRenewal(500);
      });
  }, delay);
}

function tokenPromiseInit(credentials) {
  return new Promise(function(resolve, reject) {
    getAccessToken(credentials)
      .then(resolve)
      .catch(reject);
  });
}

function getAccessToken(credentials) {
  var options = {
    method: 'POST',
    url: 'https://my-eu.sapanywhere.com:443/oauth2/token?client_id=' + credentials.client_id
          + '&client_secret=' + credentials.client_secret
          + '&grant_type=refresh_token&refresh_token=' + credentials.refresh_token,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  };

  return new Promise(function(resolve, reject) {
    request(options, function (err, res, body) {
      var data;
      if (body) { data = JSON.parse(body); }

      if (err) {
        reject(err);
      } else if (data.error) {
        reject(new Error(data.error_description));
      } else {
        resolve(data);
      }
    });
  });
}

module.exports = AuthService;

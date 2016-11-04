'use strict';

var request = require('request');
var Promise = require('es6-promise').Promise;

function AuthService(credentials) {
  this.authorisationAttempts = 0;

  if (!credentials) {
    throw new Error('SAP - Please provide credentials.');
  } else if (!credentials.client_id || !credentials.client_secret || !credentials.refresh_token) {
    throw new Error('SAP - Insufficient credentials.');
  } else {
    this.credentials = credentials;
  }

  this.tokenPromiseInit(this.credentials);
}

AuthService.prototype.tokenPromiseInit = function (credentials) {
  this.tokenPromise = newTokenPromise(credentials);
  this.scheduleTokenRenewal();
};

AuthService.prototype.scheduleTokenRenewal = function () {
  var that = this;

  this.tokenPromise
    .then(function (tokenData) {
      this.authorisationAttempts = 0;
      var tokenExpiry = Math.round((tokenData.expires_in * 1000) / 2);

      setTimeout(function () {
        that.tokenPromiseInit(that.credentials);
      }, tokenExpiry);
    })
    .catch(function (error) {

      if (this.authorisationAttempts < 3) {
        this.authorisationAttempts++;
        console.log('SAP - Error whilst authenticating: ' + JSON.stringify(error) + ". Retrying Attempt " + this.authorisationAttempts);
        setTimeout(function () {
          that.tokenPromiseInit(that.credentials);
        }, 5000);
      } else {
        reject(error)
      }
      
      
    });
};

function newTokenPromise(credentials) {
  var options = {
    method: 'POST',
    url: 'https://my-eu.sapanywhere.com:443/oauth2/token?client_id=' + credentials.client_id
          + '&client_secret=' + credentials.client_secret
          + '&grant_type=refresh_token&refresh_token=' + credentials.refresh_token,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  };

  return new Promise(function (resolve, reject) {
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

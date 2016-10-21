var request = require('request');
var Promise = require('es6-promise').Promise;

function AuthService(credentials) {
  if (!credentials) {
    throw new Error('SAP - Please provide credentials.');
  } else if (!credentials.client_id || !credentials.client_secret || !credentials.refresh_token) {
    throw new Error('SAP - Insufficient credentials.');
  } else {
    this.client_id      = credentials.client_id;
    this.client_secret  = credentials.client_secret;
    this.refresh_token  = credentials.refresh_token;
  }

  this.tokenPromise = new Promise(function(resolve, reject) {
    getAccessToken()
      .then(resolve)
      .catch(reject);
  });
}

function getAccessToken() {
  var options = {
    method: 'POST',
    url: 'https://my-eu.sapanywhere.com:443/oauth2/token?client_id=' + this.client_id
          + '&client_secret=' + this.client_secret
          + '&grant_type=refresh_token&refresh_token=' + this.refresh_token,
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
      } else if (!err && data.error) {
        reject(new Error(data.error_description));
      } else {
        resolve(data.access_token);
      }
    });
  });
}

module.exports = AuthService;

'use strict';

var request = require('request');
var Promise = require('es6-promise').Promise;

function Sap(credentials) {
  this.expires_in = 43199;
  this.scope      = 'BusinessData_R BusinessData_RW auth:tenant:766';
  this.token_type = 'bearer';

  this.httpUri    = 'https://api-eu.sapanywhere.com:443';
  this.version    = 'v1';

  if (!credentials) {
    console.error(new Error('SAP - Please provide credentials.'));
  } else if (!credentials.client_id || !credentials.client_secret || !credentials.refresh_token) {
    console.error(new Error('SAP - Insufficient credentials.'));
  } else {
    this.credentials = credentials;
  }
}

Sap.prototype.execute = function (args, callback) {
  var that = this;
  var requestParams = formatParams(args.params);

  var tokenPromise = new Promise(function (resolve, reject) {
    if (that.access_token) {
      resolve();
    } else {
      getAccessToken(that.credentials, function (err, data) {
        if (err) {
          reject(err);
        } else {
          that.access_token = data.access_token;
          resolve();
        }
      });
    }
  });

  tokenPromise.then(function () {
    var options = {
      method: args.method,
      url: that.httpUri + '/' + that.version + '/' + args.path + '?' + requestParams + 'access_token=' + that.access_token,
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(args.body),
    };

    request(options, function (err, res, body) {
      if (err) {
        callback(err);
      } else if (!err && res.statusCode !== 200) {
        callback(new Error('Received a ' + res.statusCode + ' error.'));
      } else {
        callback(null, JSON.parse(body));
      }
    });
  }, function (err) { // TODO: refactor to catch block
    callback(err);
  });
};

function getAccessToken(credentials, callback) {
  var options = {
    method: 'POST',
    url: 'https://my-eu.sapanywhere.com:443/oauth2/token?client_id=' + credentials.client_id
          + '&client_secret=' + credentials.client_secret
          + '&grant_type=refresh_token&refresh_token=' + credentials.refresh_token,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  };

  request(options, function (err, res, body) {
    var error = err,
      data;
    if (body) data = JSON.parse(body);

    if (!error && data.error) error = new Error(data.error_description);

    callback(error, data);
  });
}

function formatParams(params) {
  var requestParams = '';
  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      requestParams += key + '=' + params[key] + '&';
    }
  }
  return requestParams;
}

module.exports = function (credentials) {
  return new Sap(credentials);
};

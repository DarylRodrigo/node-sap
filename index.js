'use strict';

var request = require('request');
var AuthService = require('./services/authService');

function Sap(credentials) {
  this.authService = new AuthService(credentials);

  this.httpUri = 'https://api-eu.sapanywhere.com:443';
  this.version = 'v1';
}

Sap.prototype.execute = function (args, callback) {
  var that = this;
  var requestParams = formatParams(args.params);

  that.authService.accessToken()
    .then(function (accessToken) {
      var options = {
        method: args.method,
        url: that.httpUri + '/' + that.version + '/' + args.path +
          '?' + requestParams + 'access_token=' + accessToken,
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(args.body),
      };

      request(options, function (err, res, body) {
        var data;

        if (err && !res) return callback(err);

        if (body) data = JSON.parse(body);

        if (!err && res.statusCode >= 400) {
          err = new Error(res.statusCode + ' error' +
            (data && data.errorCode ? ': ' + data.message : ''));
        }

        return callback(err, data, res.statusCode, res.headers);
      });
    })
    .catch(callback);
};

function formatParams(params) {
  var requestParams = '';

  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      requestParams += key + '=' + params[key] + '&';
    }
  }

  return requestParams;
}

module.exports = Sap;

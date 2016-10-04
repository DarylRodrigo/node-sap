'use strict';

var request = require('request');

function Sap(credentials) {
  this.expires_in = 43199;
  this.scope      = "BusinessData_R BusinessData_RW auth:tenant:766";
  this.token_type = "bearer";

  this.httpUri    = "https://api-eu.sapanywhere.com:443";
  this.version    = "v1";

  if (!credentials) {
    console.error(new Error("SAP - Please provide credentials."));
  } else if (!credentials.client_id || !credentials.client_secret || !credentials.refresh_token) {
    console.error(new Error("SAP - Insufficient credentials."));
  } else {
    this.client_id      = credentials.client_id;
    this.client_secret  = credentials.client_secret;
    this.refresh_token  = credentials.refresh_token;

    // FIXME: sets access token asynchronously
    getAccessToken(credentials, callback.bind(this));

    function callback(err, data) {
      if (err) {
        console.error(err);
      } else {
        this.access_token = data.access_token;
      }
    }
  }
}

Sap.prototype.execute = function (method, path, params, callback) {
  var options = {
    method: method,
    url: this.httpUri +'/'+ this.version +'/'+ path +'?access_token='+ this.access_token,
    body: encodeURIComponent(JSON.stringify(params))
  };

  request(options, callback);
};

function getAccessToken(credentials, callback) {
  var options = {
      method: 'POST',
      url: 'https://my-eu.sapanywhere.com:443/oauth2/token?client_id='+ credentials.client_id
            +'&client_secret='+ credentials.client_secret
            +'&grant_type=refresh_token&refresh_token='+ credentials.refresh_token,
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    };

  request(options, function (err, res, body) {
    var data = JSON.parse(body);
    if (!err && data.error) err = new Error(data.error_description);

    callback(err, data);
  });
}

module.exports = function (credentials) {
  return new Sap(credentials);
};

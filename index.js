'use strict';

var request = require('request');

function sap(options) {
  this.expires_in     = 43199;
  this.scope          = "BusinessData_R BusinessData_RW auth:tenant:766";
  this.token_type     = "bearer";

  this.httpUri        = "https://api-eu.sapanywhere.com:443";
  this.version        = "v1";

  if (!options) {
    console.error("SAP - Please provide options.")
  } else if (!options.client_id || !options.client_secret || !options.refresh_token) {
    console.error("SAP - Insufficient credentials.")
  } else {
    this.client_id = options.client_id;
    this.client_secret = options.client_secret;
    this.refresh_token = options.refresh_token;
  }
}

sap.prototype.getAccessToken = function (callback) {
  var options = {
    url: 'https://my-eu.sapanywhere.com:443/oauth2/token?client_id=' + this.client_id + '&client_secret=' + this.client_secret + '&grant_type=refresh_token&refresh_token=' +this.refresh_token,
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  };

  function cb(err, res, body) {
    var data = JSON.parse(body);

    if (!err && res.statusCode === 200) {
      this.access_token = body.access_token;
    } else {
      console.error(err);
    }
  }

  request.post(options, callback || cb);
};

module.exports = function (options) {
  return new sap(options);
};

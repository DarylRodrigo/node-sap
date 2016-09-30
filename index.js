'use strict';

var request = require('request');

function Sap(credentials) {
  this.expires_in     = 43199;
  this.scope          = "BusinessData_R BusinessData_RW auth:tenant:766";
  this.token_type     = "bearer";

  this.httpUri        = "https://api-eu.sapanywhere.com:443";
  this.version        = "v1";

  if (!credentials) {
    console.error("SAP - Please provide credentials.")
  } else if (!credentials.client_id || !credentials.client_secret || !credentials.refresh_token) {
    console.error("SAP - Insufficient credentials.")
  } else {
    this.client_id = credentials.client_id;
    this.client_secret = credentials.client_secret;
    this.refresh_token = credentials.refresh_token;

    this.getAccessToken();
  }
}

Sap.prototype.getAccessToken = function (callback) {
  var options = {
    url: 'https://my-eu.sapanywhere.com:443/oauth2/token?client_id=' + this.client_id + '&client_secret=' + this.client_secret + '&grant_type=refresh_token&refresh_token=' +this.refresh_token,
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  };

  request.post(options, callback || cb.bind(this));

  function cb(err, res, body) {
    if (!err && res.statusCode === 200) {
      this.access_token = JSON.parse(body).access_token;
    } else {
      console.error(err);
    }
  }
};

module.exports = function (credentials) {
  return new Sap(credentials);
};

'use strict';

var Request = require('request');

function sap(options) {

  this.expires_in     = 43199;
  this.scope          = "BusinessData_R BusinessData_RW auth:tenant:766";
  this.token_type     = "bearer";

  this.httpUri        = "https://api-eu.sapanywhere.com:443";
  this.version        = "v1"

  if (!options) {
    console.error("SAP - Please provide options.")
  } else if (!options.client_id || !options.client_secret || !options.refresh_token) {
    console.error("SAP - insufficient credentials.")
  } else {
    this.client_id = options.client_id;
    this.client_secret = options.client_secret;
    this.refresh_token = options.refresh_token;

    this.getAccessToken();
  }
}

sap.prototype.execute = function (method, path, params, callback) {
  var finalParams = params || {};

  Request({
    uri : this.httpUri+'/'+this.version+'/' + path + '?access_token=' + this.access_token,
    method: method,
    headers: [
      {
        name: 'content-type',
        value: 'application/x-www-form-urlencoded'
      }
    ],
    body : encodeURIComponent(JSON.stringify(finalParams))
  }, function (error, response, body) {
    callback(error, response, body);
  });
};

sap.prototype.getCustomers = function (cb) {
  this.execute("GET", "Customers", {}, function(error, response, body) {
    cb(error, response, body);
  });
}

sap.prototype.getAccessToken = function () {

  Request({
    uri : "https://my-eu.sapanywhere.com:443/oauth2/token?client_id=" + this.client_id + "&client_secret=" + this.client_secret + "&grant_type=refresh_token&refresh_token=" +this.refresh_token,
    method: "POST",
    headers: [
      {
        name: 'content-type',
        value: 'application/x-www-form-urlencoded'
      }
    ]
  }, (error, response, body) => {
    var data = JSON.parse(body);
    if (error) {
      console.error("Incorrect authentication details")
    } else {
      this.access_token = data.access_token;
    }
  });
};

module.exports = function (options) {
  return new sap(options);
};
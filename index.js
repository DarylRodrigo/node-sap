'use strict';

var request = require('request');
var Resource = require('./services/resourceService');
var SapRequest = require('./services/executeService');

function Sap(credentials) {
  this.credentials = credentials;
  this.httpUri = 'https://api-eu.sapanywhere.com:443';
  this.version = 'v1';

  this.sapRequest = new SapRequest(this.credentials);
}

Sap.prototype.execute = function (args, callback) {
  this.sapRequest.execute(args, function(error, data, status, headers) {
    callback (error, data, status, headers);
  })
};

Sap.prototype.createResource = function (resourceName) {
  return new Resource(resourceName, this.sapRequest);
}

module.exports = Sap;

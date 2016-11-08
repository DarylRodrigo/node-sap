'use strict';

var Resource = require('./services/resource');
var SapHelper = require('./services/sapHelper');

function Sap(credentials) {
  this.credentials = credentials;
  this.httpUri = 'https://api-eu.sapanywhere.com:443';
  this.version = 'v1';

  this.sapHelper = new SapHelper(this.credentials);
}

Sap.prototype.execute = function (args, callback) {
  this.sapHelper.execute(args, callback);
};

Sap.prototype.createResource = function (resourceName, options) {
  return new Resource(resourceName, this.sapHelper, options);
}

module.exports = Sap;

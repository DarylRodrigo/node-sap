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


/**
 * Sends a given request as a JSON object to the SAP API and finally
 * calls the given callback function with the resulting JSON object. This
 * method should not be called directly but will be used internally by all API
 * methods defined.
 *
 * @param method MailChimp API method to call
 * @param availableParams Parameters available for the specified API method
 * @param givenParams Parameters to call the MailChimp API with
 * @param callback Callback function to call on success
 */

sap.prototype.execute = function (method, path, params, callback) {
  var finalParams = {};
  var currentParam;

  for (var i = 0; i < availableParams.length; i++) {
    currentParam = availableParams[i];
    if (typeof givenParams[currentParam] !== 'undefined')
      finalParams[currentParam] = givenParams[currentParam];
  }

  request({
    uri : this.httpUri+'/'+this.version+'/' + path + '?access_token=' + this.access_token,
    method: method,
    headers: [
      {
        name: 'content-type',
        value: 'application/x-www-form-urlencoded'
      }
    ]
    body : encodeURIComponent(JSON.stringify(finalParams))
  }, function (error, response, body) {
    helpers.handleMailChimpResponse(error, response, body, callback);
  });
};

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
  }, function (error, response, body) {
    var data = JSON.parse(body);
    if (error) {
      console.error("Incorrect authentication details")
    }
    this.access_token = data.access_token;
  });
};

module.exports = function (options) {
  return new sap(options);
};
'use strict';

var Promise = require('es6-promise').Promise;
var execute = require('./executeService');

function Resource(resourceName, sapRequest) {
  this.resourceName = resourceName;
  this.sapRequest = sapRequest
}

Resource.prototype.create = function (body) {
  var that = this;

  return new Promise(function (resolve, reject) {

    var requestParams = {
      method: 'POST',
      path: that.resourceName,
      body: body
    };

    that.sapRequest.execute(requestParams,function(error, data) {
      if (error) {
        reject (error);
      }
      else {
        resolve (data);
      }
    })
  })
}

Resource.prototype.findAll = function (filter) {
  var that = this;

  return new Promise(function (resolve, reject) {

    var requestParams = {
      method: 'GET',
      path: that.resourceName
    };

    if (filter) requestParams.params =  { "filter": filter };

    that.sapRequest.execute(requestParams,function(error, data) {

      if (error) {
        reject (error);
      }
      else {
        resolve (data);
      }
    })
  })
}

Resource.prototype.findById = function(id, filter) {
  var that = this;

  return new Promise(function (resolve, reject) {

    var requestParams = {
      method: 'GET',
      path: that.resourceName + "/" + id
    };

    if (filter) requestParams.params =  { "filter": filter };

    that.sapRequest.execute(requestParams,function(error, data) {
      if (error) {
        reject (error);
      }
      else {
        resolve (data);
      }
    })
  })
}

Resource.prototype.updateById = function(id, body) {
  var that = this;

  return new Promise(function (resolve, reject) {

    var requestParams = {
      method: 'PATCH',
      path: that.resourceName + "/" + id,
      body: body
    };

    that.sapRequest.execute(requestParams,function(error, data) {
      if (error) {
        reject (error);
      }
      else {
        resolve (data);
      }
    })
  })
}

module.exports = Resource;
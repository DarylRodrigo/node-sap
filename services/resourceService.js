'use strict';

var Promise = require('es6-promise').Promise;
var execute = require('./executeService');
var NodeCache = require('node-cache');

function Resource(resourceName, sapRequest, options) {
  this.resourceName = resourceName;
  this.sapRequest = sapRequest
  this.cache = false;

  if (options.cache) {
    var checkPeriod = (options.cacheTime) ?  options.cacheTime : 60 ;
    var stdTTL = (options.stdTTL) ? options.stdTTL : 120 ;

    this.cache = true;
    this.resourecCache = new NodeCache({
      stdTTL: stdTTL,
      checkperiod: checkPeriod,
    });
  }
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
  var requestParams = {
    method: 'GET',
    path: that.resourceName
  };

  if (filter) requestParams.params =  { "filter": filter };

  return new Promise(function (resolve, reject) {

    // check if cached
    if (that.cache) {
      that.resourecCache.get(that.resourceName, function(error, val) {
        if (error) reject(error);

        if (val === undefined) {
          that.sapRequest.execute(requestParams,function(error, data) {
            if (error) {
              reject (error);
            }
            else {
              that.resourecCache.set(that.resourceName, data, function( err, success ){
                if( !err && success ){
                  resolve (data);
                }
                else {
                  reject(err);
                }
              });
              
            }
          });

        } else {
          resolve(val);
        }
      });
    } 
    // if cached if off - do request
    else {
      that.sapRequest.execute(requestParams,function(error, data) {
        if (error) {
          reject (error);
        }
        else {
          resolve (data);
        }
      });
    }
  });
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
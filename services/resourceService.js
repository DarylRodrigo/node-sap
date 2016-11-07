'use strict';

var Promise = require('es6-promise').Promise;
var NodeCache = require('node-cache');

function Resource(resourceName, sapHelper, options) {
  this.resourceName = resourceName;
  this.sapHelper = sapHelper;
  this.isCaching = false;

  if (options && options.isCaching) {
    var checkPeriod = options.cacheTime ?  options.cacheTime : 60 ;
    var stdTTL = options.stdTTL ? options.stdTTL : 120 ;

    this.isCaching = true;
    this.cache = new NodeCache({
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

    that.sapHelper.execute(requestParams, function(error, data, status) {
      if (error) reject (error);
      else if (!error && status >= 400) {
        error = new Error(status + ' error' +
          (data && data.errorCode ? ': ' + data.message : ''));

        reject(error);
      }
      else resolve (data);
    });
  });
}

Resource.prototype.findAll = function (filter) {
  var that = this;

  var requestParams = {
    method: 'GET',
    path: that.resourceName
  };

  if (filter) requestParams.params = { "filter": filter };

  return new Promise(function (resolve, reject) {
    // check if caching is on
    if (that.isCaching) {
      that.cache.get(that.resourceName, function (error, val) {
        if (error) reject(error);

        if (val === undefined) {
          that.sapHelper.execute(requestParams, function (error, data, status) {
            if (error) reject(error);
            else if (!error && status >= 400) {
              error = new Error(status + ' error' +
                (data && data.errorCode ? ': ' + data.message : ''));

              reject(error);
            } else {
              that.cache.set(that.resourceName, data, function (err, success) {
                if (!err && success) resolve(data);
                else reject(err);
              });
            }
          });
        } else {
          resolve(val);
        }
      });
    } else {
      // if caching is off, execute request
      // TODO: handle error statuses
      that.sapHelper.execute(requestParams, function (error, data, status) {
        if (error) reject(error);
        else if (!error && status >= 400) {
          error = new Error(status + ' error' +
						(data && data.errorCode ? ': ' + data.message : ''));

          reject(error);
        }
        else resolve(data);
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

    if (filter) requestParams.params = { "filter": filter };

    that.sapHelper.execute(requestParams, function (error, data) {
      if (error) reject(error);
      else resolve(data);
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

    that.sapHelper.execute(requestParams, function (error, data) {
      if (error) reject(error);
      else resolve(data);
    });
  });
}

module.exports = Resource;

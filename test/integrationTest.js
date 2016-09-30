'use strict';

var credentials = require('./auth.json');
var expect = require('chai').expect;
var should = require('chai').should();

describe('API integration', function () {
  var sap = require('../index')(credentials);

  describe('getAccessToken', function() {
    it('gets an authentication token', function(done) {
      sap.getAccessToken(function (err, res, body) {
        should.exist(JSON.parse(body).access_token);
        done();
      });
    });
  });
});

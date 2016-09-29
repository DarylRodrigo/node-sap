'use strict';

var auth = require('./auth.json');
var expect = require('chai').expect;
var should = require('chai').should();

var sap = require('../index')(auth);

describe('API integration', function () {
  describe('getAccessToken', function() {
    it('gets an authentication token', function(done) {
      sap.getAccessToken(function (err, res, body) {
        should.exist(JSON.parse(body).access_token);
        done();
      });
    });
  });
})

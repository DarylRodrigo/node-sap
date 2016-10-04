'use strict';

var credentials = require('../auth.json');
var expect = require('chai').expect;

describe('API integration', function () {
  var sap = require('../index')(credentials);

  this.timeout(3000);

  describe('initialization', function () {
    it('sets an authentication token', function (done) {
      setTimeout(function() {
        expect(sap.access_token).to.exist;
        done();
      }, 1000)
    });
  });

  describe('execute', function () {
    it('sends custom HTTP requests', function (done) {
      sap.execute('GET', 'Currencies', null, function (err, res, body) {
        var data;
        if (body) data = JSON.parse(body);

        expect(res.statusCode).to.equal(200);
        expect(data.length).to.be.above(0);
        expect(data.error).not.to.exist;
        done();
      });
    });
  });
});

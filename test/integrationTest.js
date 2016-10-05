'use strict';

var credentials = require('../auth.json');
var expect = require('chai').expect;

describe('Integration tests', function () {
  this.timeout(5000);

  var sap = require('../index')(credentials);

  describe('execute', function () {
    xit('sends custom HTTP requests', function (done) {
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

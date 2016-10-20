'use strict';

var credentials = require('../auth.json');
var expect = require('chai').expect;

describe('Integration tests', function () {
  this.timeout(5000);

  var sap = require('../index')(credentials);

  describe('execute', function () {
    // Enable tests by removing the 'x' in front of the line below
    it('sends custom HTTP requests', function (done) {
      var options = {
        method: 'GET',
        path: 'Currencies',
        params: {}
      };

      sap.execute(options, function (err, data) {
        console.log(err);
        expect(data.length).to.be.above(0);
        expect(data.error).not.to.exist;
        done();
      });
    });
  });
});

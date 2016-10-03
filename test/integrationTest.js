'use strict';

var credentials = require('../auth.json');
var expect = require('chai').expect;

describe('API integration', function () {
  var sap;

  this.timeout(3000);

  function initModule(credentials) {
    sap = undefined;
    sap = require('../index')(credentials);
  }

  it('Should create authentication token', function(done) {
    initModule(credentials);

    setTimeout(function() {
      expect(sap.access_token).to.exist;
      done();
    }, 1000)
  });
});

'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var Sap = require('../../index');
var credentials = require('../support/testCredentials');

chai.use(sinonChai);

describe('Sap', function () {
  var sap;

  beforeEach(function () {
    sap = new Sap(credentials);
  });

  describe('execute', function () {
    it('delegates to sapHelper module', function () {
      var execute = sinon.stub(sap.sapHelper, 'execute');
      var args = {};
      var callback = function () {};

      sap.execute(args, callback);

      execute.restore();
      expect(execute).to.have.been.calledWith(args, callback);
    });
  });

  describe.skip('createResource', function () {

  });
});

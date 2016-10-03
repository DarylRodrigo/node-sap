'use strict';

var mockAPI = require('./helpers/mockAPI.js');
var credentials = require('../auth.json');
var sinon = require('sinon');
var expect = require('chai').expect;
var request = require('request');

describe('SAP module', function () {
  var sap,
    consoleError,
    initModule;

  beforeEach(function () {
    initModule(credentials);
    consoleError = sinon.stub(console, 'error');
  });

  afterEach(function () {
    consoleError.restore();
  });

  describe('initialization', function () {
    it('sets the credentials', function () {
      expect(sap.client_id).to.exist;
      expect(sap.client_secret).to.exist;
      expect(sap.refresh_token).to.exist;
    });

    it('sets the access token', function (done) {
      setTimeout(function () {
        expect(sap.access_token).to.equal('mock_token');
        done();
      }, 100);
    });

    describe('when no options are passed', function () {
      it('logs an error to the console', function () {
        initModule();
        sinon.assert.calledOnce(consoleError);
      });
    });

    describe('when insufficient options are passed', function () {
      it('logs an error to the console', function () {
        initModule({ client_id: 'foo', client_secret: 'bar' });
        sinon.assert.calledOnce(consoleError);
      });
    });

    describe('when unable to get an access token', function () {
      it('logs an error to the console', function (done) {
        initModule({ client_id: 'incorrect', client_secret: 'incorrect', refresh_token: 'incorrect'});

        setTimeout(function () {
          sinon.assert.calledOnce(consoleError);
          expect(mockAPI.badAuthEndpoint.isDone()).to.be.true;
          done();
        }, 100);
      });
    });
  });

  initModule = function (credentials) {
    sap = undefined;
    sap = require('../index')(credentials);
  }
});

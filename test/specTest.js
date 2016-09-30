'use strict';

var auth = require('./auth.json');
var sinon = require('sinon');
var expect = require('chai').expect;
var should = require('chai').should();
var request = require('request');

describe('SAP module', function () {
  var sap,
    consoleError,
    postRequest,
    res = { statusCode: 200, body: { access_token: 123 } },
    err = new Error('Test error');

  function initModule(auth) {
    sap = undefined;
    sap = require('../index')(auth);
  }

  beforeEach(function () {
    initModule(auth);
    consoleError = sinon.stub(console, 'error');
  });

  afterEach(function () {
    consoleError.restore();
  });

  describe('initialization', function () {
    it('sets auth options', function () {
      should.exist(sap.client_id);
      should.exist(sap.client_secret);
      should.exist(sap.refresh_token);
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
  });

  describe('getAccessToken', function() {
    it('sends a POST request', sinon.test(function() {
      postRequest = this.stub(request, 'post');

      sap.getAccessToken();
      sinon.assert.calledOnce(postRequest);
    }));

    it('logs an error to the console', sinon.test(function () {
      postRequest = this.stub(request, 'post');
      postRequest.yields(err, null, null);

      sap.getAccessToken();
      should.not.exist(sap.access_token);
      sinon.assert.calledOnce(consoleError);
    }));
  });
});

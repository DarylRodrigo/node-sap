'use strict';

var auth = require('./auth.json');
var sinon = require('sinon');
var expect = require('chai').expect;
var should = require('chai').should();
var request = require('request');

describe('SAP module', function () {
  var sap;

  function initModule(auth) {
    sap = require('../index')(auth);
  }

  beforeEach(function () {
    sap = undefined;
    initModule(auth);
  });

  describe('initialization', function () {
    var error;

    beforeEach(function () {
      error = sinon.stub(console, 'error');
    });

    afterEach(function () {
      error.restore();
    });

    it('sets auth options', sinon.test(function () {
      should.exist(sap.client_id);
      should.exist(sap.client_secret);
      should.exist(sap.refresh_token);
    }));

    describe('when no options are passed', function () {
      it('logs an error to the console', function () {
        sap = undefined;
        initModule();

        sinon.assert.calledOnce(error);
      });
    });

    describe('when insufficient options are passed', function () {
      it('logs an error to the console', function () {
        sap = undefined;
        initModule({ client_id: 'foo', client_secret: 'bar' });

        sinon.assert.calledOnce(error);
      });
    });
  });

  describe('getAccessToken', function() {
    var postRequest;

    beforeEach(function () {
      postRequest = sinon.stub(request, 'post');
    });

    afterEach(function () {
      postRequest.restore();
    });

    it('sends a POST request', function() {
      sap.getAccessToken();

      sinon.assert.calledOnce(postRequest);
    });
  });
});

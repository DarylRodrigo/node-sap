'use strict';

var nock = require('nock');
var credentials = require('./auth.json');
var sinon = require('sinon');
var expect = require('chai').expect;
var request = require('request');

describe('SAP module', function () {
  var sap,
    consoleError;

  var mockAPI = nock('https://my-eu.sapanywhere.com:443/oauth2', {
      reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    .persist()
    .post('/token?client_id=' + credentials.client_id + '&client_secret=' + credentials.client_secret + '&grant_type=refresh_token&refresh_token=' + credentials.refresh_token)
    .reply(200, {
      access_token: 'mock_token'
    });

  var incorrectAPI = nock('https://my-eu.sapanywhere.com:443/oauth2', {
      reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    .post('/token?client_id=incorrect')
    .reply(200, {
      access_token: 'mock_token'
    });

  function initModule(credentials) {
    sap = undefined;
    sap = require('../index')(credentials);
  }

  beforeEach(function () {
    initModule(credentials);
    consoleError = sinon.stub(console, 'error');
  });

  afterEach(function () {
    consoleError.restore();
  });

  describe('initialization', function () {
    it('sets auth options', function (done) {
      expect(sap.client_id).to.exist;
      expect(sap.client_secret).to.exist;
      expect(sap.refresh_token).to.exist;

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
  });
});

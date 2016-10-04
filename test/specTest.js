'use strict';

var nock = require('nock');
var credentials = require('../auth.json');
var sinon = require('sinon');
var expect = require('chai').expect;

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

  after(function () {
    nock.cleanAll();
  })

  describe('initialization', function () {
    it('sets the credentials', function () {
      expect(sap.credentials).to.exist;
    });

    describe('when no credentials are passed', function () {
      it('logs an error to the console', function () {
        initModule();
        sinon.assert.calledOnce(consoleError);
      });
    });

    describe('when insufficient credentials are passed', function () {
      it('logs an error to the console', function () {
        initModule({ client_id: 'foo', client_secret: 'bar' });
        sinon.assert.calledOnce(consoleError);
      });
    });
  });

  describe('execute()', function () {
    var path = 'Customers',
      mockToken = 'mock_token',
      statusCode = 200,
      expectedResult = { 'id': '1' },
      mockAuth,
      mockAPI;

    before(function () {
      mockAuth = nock('https://my-eu.sapanywhere.com:443/oauth2', {
          reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
        })
        .persist()
        .post('/token?client_id=' + credentials.client_id + '&client_secret=' + credentials.client_secret + '&grant_type=refresh_token&refresh_token=' + credentials.refresh_token)
        .reply(200, {
          'access_token': 'mock_token'
        });
    });

    beforeEach(function () {
      mockAPI = nock(sap.httpUri)
        .get('/'+ sap.version +'/'+ path +'?access_token='+ mockToken)
        .reply(statusCode, expectedResult);
    });

    it('sets the access token', function (done) {
      sap.execute('GET', path, null, function (err, res, body) {
        expect(sap.access_token).to.equal(mockToken);
        done();
      });
    });

    it('passes the response to the callback', function (done) {
      sap.execute('GET', path, null, function (err, res, body) {
        expect(res.statusCode).to.equal(statusCode);
        expect(JSON.parse(body)).to.eql(expectedResult);
        done();
      });
    });

    describe('when unable to get an access token', function () {
      it('passes the error to the callback', function (done) {
        initModule({ client_id: 'incorrect', client_secret: 'incorrect', refresh_token: 'incorrect'});

        var badAuth = nock('https://my-eu.sapanywhere.com:443/oauth2', {
            reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
          })
          .post('/token?client_id=' + 'incorrect' + '&client_secret=' + 'incorrect' + '&grant_type=refresh_token&refresh_token=' + 'incorrect')
          .reply(200, {
            'error': 'mock_error',
            'error_description': 'Mock error description'
          });

        sap.execute('GET', path, null, function (err, res, body) {
          expect(err.message).to.eql('Mock error description');
          expect(badAuth.isDone()).to.be.true;
          done();
        });
      });
    });
  });

  initModule = function (credentials) {
    sap = undefined;
    sap = require('../index')(credentials);
  }
});

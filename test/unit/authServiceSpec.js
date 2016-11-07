'use strict';

var expect = require('chai').expect;
var nock = require('nock');
var Promise = require('es6-promise').Promise;
var testCredentials = require('../support/testCredentials');
var AuthService = require('../../services/authService');

describe('AuthService', function () {
  var mockToken = 'mock_token',
      authService,
      credentials;

  beforeEach(function() {
    credentials = JSON.parse(JSON.stringify(testCredentials));
    authService = new AuthService(credentials);

    nock('https://my-eu.sapanywhere.com:443/oauth2', {
      reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
    })
      .post('/token?client_id=' + credentials.client_id
        + '&client_secret=' + credentials.client_secret
        + '&grant_type=refresh_token&refresh_token=' + credentials.refresh_token)
      .reply(200, {
        access_token: mockToken,
        expires_in: 43199
      });
  });

  afterEach(function () {
    nock.cleanAll();
  });

  describe('initialization', function () {
    it('sets credentials', function () {
      expect(authService.credentials).to.exist;
    });

    describe('when passed no credentials', function () {
      it('throws an error', function () {
        var initializer = function () { new AuthService(); };

        expect(initializer).to.throw(Error, /Please provide credentials/);
      });
    });

    describe('when passed insufficient credentials', function () {
      it('throws an error', function () {
        var badCredentials = { client_id: '1234' };
        var initializer = function () { new AuthService(badCredentials); };

        expect(initializer).to.throw(Error, /Insufficient credentials/);
      });
    });
  });

  describe('accessToken', function () {
    it('creates accessToken which resolves with a token', function (done) {
      authService.accessToken()
        .then(function(accessToken) {
          expect(accessToken).to.equal(mockToken);
          done();
        })
        .catch(done);
    });

    describe('when accessing tokenPromise multiple times', function() {
      it('does not make multiple accessToken requests', function(done) {
        // nock will throw an error if the request is made multiple times
        Promise.all([
          authService.accessToken(),
          authService.accessToken(),
        ])
          .then(function(results) {
            expect(results[0]).to.equal(mockToken);
            expect(results[1]).to.equal(mockToken);
            done();
          })
          .catch(done);
      });
    });

    describe('when token expiry has elapsed', function () {
      it('fetches and resolves with a new token', function (done) {
        var expiry = 1;
        credentials.client_id = 'short_expiry';

        var firstRequest = nock('https://my-eu.sapanywhere.com:443/oauth2', {
          reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
        })
          .post('/token?client_id=' + credentials.client_id
          + '&client_secret=' + credentials.client_secret
          + '&grant_type=refresh_token&refresh_token=' + credentials.refresh_token)
          .reply(200, {
            access_token: mockToken,
            expires_in: expiry
          });

        var secondRequest = nock('https://my-eu.sapanywhere.com:443/oauth2', {
          reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
        })
          .post('/token?client_id=' + credentials.client_id
          + '&client_secret=' + credentials.client_secret
          + '&grant_type=refresh_token&refresh_token=' + credentials.refresh_token)
          .reply(200, {
            access_token: 'second_token',
            expires_in: 5000
          });

        authService = new AuthService(credentials);

        authService.accessToken()
          .then(function () {
            setTimeout(function () {
              authService.accessToken()
                .then(function (accessToken) {
                  expect(accessToken).to.equal('second_token');
                  expect(secondRequest.isDone()).to.be.true;
                  done();
                });
            }, (expiry * 1000));
          });
      });
    });
  });
});

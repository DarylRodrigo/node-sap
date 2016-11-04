'use strict';

var expect = require('chai').expect;
var nock = require('nock');
var credentials = require('../support/testCredentials');
var AuthService = require('../../services/authService');
var Promise = require('es6-promise').Promise;

describe('AuthService', function () {
  this.timeout(6000);
  var mockToken = 'mock_token';

  beforeEach(function () {
    nock('https://my-eu.sapanywhere.com:443/oauth2', {
      reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
    })
      .post('/token?client_id=' + credentials.client_id +
        '&client_secret=' + credentials.client_secret +
        '&grant_type=refresh_token&refresh_token=' + credentials.refresh_token)
      .reply(200, {
        access_token: mockToken,
        expires_in: 43200
      });
  });

  afterEach(function () {
    nock.cleanAll();
  });

  describe('initialization', function () {
    it('sets credentials', function () {
      var authService = new AuthService(credentials);

      expect(authService.credentials).to.exist;
    });

    it('creates tokenPromise which resolves with an access token and expiry info', function (done) {
      var authService = new AuthService(credentials);

      authService.tokenPromise
        .then(function (tokenData) {
          expect(tokenData.access_token).to.equal(mockToken);
          done();
        })
        .catch(done);
    });

    it('repeatedly reinitialises tokenPromise after half its expiry time', function (done) {
      credentials.client_id = 'token_renewal_test';

      nock('https://my-eu.sapanywhere.com:443/oauth2', {
        reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
      })
        .persist()
        .post('/token?client_id=' + credentials.client_id +
          '&client_secret=' + credentials.client_secret +
          '&grant_type=refresh_token&refresh_token=' + credentials.refresh_token)
        .reply(200, {
          access_token: mockToken,
          expires_in: 1
        });

      var authService = new AuthService(credentials);
      var firstTokenPromise = authService.tokenPromise;

      setTimeout(function () {
        var secondTokenPromise = authService.tokenPromise;
        setTimeout(function () {
          var thirdTokenPromise = authService.tokenPromise;
          expect(firstTokenPromise).to.not.equal(secondTokenPromise);
          expect(firstTokenPromise).to.not.equal(thirdTokenPromise);
          expect(secondTokenPromise).to.not.equal(thirdTokenPromise);
          done();
        }, 600)
      }, 600)
    });

    describe('when accessing tokenPromise multiple times', function () {
      it('does not make multiple accessToken requests', function (done) {
        // nock will throw an error if the request is made multiple times
        var authService = new AuthService(credentials);

        Promise.all([
          authService.tokenPromise,
          authService.tokenPromise,
        ])
        .then(function (results) {
          expect(results[0].access_token).to.equal(mockToken);
          expect(results[1].access_token).to.equal(mockToken);
          done();
        })
        .catch(done);
      });
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
});

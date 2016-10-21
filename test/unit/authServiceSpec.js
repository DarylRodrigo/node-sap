var expect = require('chai').expect;
var nock = require('nock');
var credentials = require('../../auth.json');
var AuthService = require('../../services/authService');

describe('AuthService', function () {
  var mockToken = 'mock_token';

  nock('https://my-eu.sapanywhere.com:443/oauth2', {
    reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
  })
  .post('/token?client_id=' + credentials.client_id
    + '&client_secret=' + credentials.client_secret
    + '&grant_type=refresh_token&refresh_token=' + credentials.refresh_token)
  .reply(200, {
    access_token: mockToken
  });

  describe('initialization', function () {
    it('sets credentials', function () {
      var authService = new AuthService(credentials);

      expect(authService.client_id).to.exist;
      expect(authService.client_secret).to.exist;
      expect(authService.refresh_token).to.exist;
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

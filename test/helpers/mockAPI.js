'use strict';

var nock = require('nock');
var credentials = require('../../auth.json');

module.exports = {
  credentials: credentials,

  // IDEA: extract to single method that takes variable options
  authEndpoint: nock('https://my-eu.sapanywhere.com:443/oauth2', {
      reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    .persist()
    .post('/token?client_id=' + credentials.client_id + '&client_secret=' + credentials.client_secret + '&grant_type=refresh_token&refresh_token=' + credentials.refresh_token)
    .reply(200, {
      'access_token': 'mock_token'
    }),

  badAuthEndpoint: nock('https://my-eu.sapanywhere.com:443/oauth2', {
      reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
    })
    .post('/token?client_id=' + 'incorrect' + '&client_secret=' + 'incorrect' + '&grant_type=refresh_token&refresh_token=' + 'incorrect')
    .reply(200, {
      'error': 'mock_error',
      'error_description': 'Mock error description'
    }),

  endpoint: function (options) {
    nock(options.url)
      .get('/'+ options.version +'/'+ options.path +'?access_token='+ options.access_token)
      .reply(options.statusCode, options.expectedResult);
  }
}

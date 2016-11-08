'use strict';

var nock = require('nock');
var expect = require('chai').expect;
var Sap = require('../../index');
var credentials = require('../support/testCredentials');

describe('Cache', function () {
  this.timeout(6000);

  describe('execute', function () {
    var options,
        sapHelper = new Sap(credentials),
        mockToken = 'mock_token',
        expectedResult_v1 = [{ 'id': '1' }],
        expectedResult_v2 = [{ 'id': '2' }];

    var cacheOpts = {isCaching: true, stdTTL: 1, checkPeriod: 1}
    var Customer = sapHelper.createResource("Customers", cacheOpts);

    beforeEach(function () {
      options = {
        method: 'GET',
        path: 'Customers'
      };

      nock('https://my-eu.sapanywhere.com:443/oauth2', {
        reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
      })
        .post('/token?client_id=' + credentials.client_id +
          '&client_secret=' + credentials.client_secret +
          '&grant_type=refresh_token&refresh_token=' +
          credentials.refresh_token)
        .reply(200, {
          access_token: mockToken,
          expires_in: 43199
        });
    });

    afterEach(function () {
      nock.cleanAll();
    });

    it('should use cache on second round', function (done) {
      nock(sapHelper.httpUri)
        .get('/' + sapHelper.version +
          '/' + options.path +
          '?access_token=' + mockToken)
        .reply(200, expectedResult_v1);

      nock(sapHelper.httpUri)
        .get('/' + sapHelper.version +
          '/' + options.path +
          '?access_token=' + mockToken)
        .reply(200, expectedResult_v2);

      Customer.findAll()
        .then(function (_res) {
          // Expect v1 results
          expect(_res).to.eql(expectedResult_v1);
          return Customer.findAll();
        })
        .then (function (_res) {
          // Expect v1 results even though results are now v2
          expect(_res).to.eql(expectedResult_v1);
          done();
        })
        .catch(done);
    });

    it('should refresh cache after expiry', function (done) {
      setTimeout( function() {
        nock(sapHelper.httpUri)
          .get('/' + sapHelper.version +
            '/' + options.path +
            '?access_token=' + mockToken)
          .reply(200, expectedResult_v2);

        Customer.findAll()
          .then(function(_customers) {
            expect(_customers).to.eql(expectedResult_v2);
            done();
          })
          .catch(done);
      }, 2000);
    })
  });
});

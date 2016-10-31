'use strict';

var nock = require('nock');
var expect = require('chai').expect;
var Sap = require('../../index');
var credentials = require('../support/testCredentials');

describe('Sap', function () {
  this.timeout(6000);

  describe('execute', function () {
    var options,
      sapHelper = new Sap(credentials),
      mockToken = 'mock_token',
      expectedResult = { 'id': '1' };

    nock('https://my-eu.sapanywhere.com:443/oauth2', {
      reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
    })
      .post('/token?client_id=' + credentials.client_id +
        '&client_secret=' + credentials.client_secret +
        '&grant_type=refresh_token&refresh_token=' +
        credentials.refresh_token)
      .reply(200, {
        access_token: mockToken
      });

    beforeEach(function () {
      options = {
        method: 'GET',
        path: 'Customers'
      };
    });

    it('sends a custom GET request', function (done) {

      nock(sapHelper.httpUri)
        .get('/' + sapHelper.version +
          '/' + options.path +
          '?pasta=true&access_token=' + mockToken)
        .reply(200, expectedResult);

      options.params = {
        pasta: true
      };

      sapHelper.execute(options, function (err, data, status) {
        expect(status).to.equal(200);
        expect(data).to.eql(expectedResult);
        done();
      });
    });

    it('sends a custom POST request', function (done) {
      var customer = {
        "customerType": "INDIVIDUAL_CUSTOMER",
        "firstName": "Rick",
        "lastName": "Morty",
        "stage": "CUSTOMER"
      };

      nock(sapHelper.httpUri)
        .post('/' + sapHelper.version +
          '/' + options.path +
          '?access_token=' + mockToken)
        .reply(201, 1);

      options.method = 'POST';
      options.body = customer;

      sapHelper.execute(options, function (err, data, status) {
        expect(status).to.equal(201);
        expect(data).to.eql(1);
        done();
      });
    });

    describe('when it receives an error status code', function () {
      it('passes an error to the callback', function (done) {
        options.path = 'Invalid';
        var mockErrorMessage = 'Mock 404 error message';

        var badRequest = nock(sapHelper.httpUri)
          .get('/' + sapHelper.version +
            '/' + options.path +
            '?access_token=' + mockToken)
          .reply(404, {
            errorCode: 1234,
            message: mockErrorMessage
          });

        sapHelper.execute(options, function (err, data, status, headers) {
          expect(err.message).to.equal(404 + ' error: ' +
            mockErrorMessage);
          expect(status).to.equal(404);
          expect(badRequest.isDone()).to.be.true;
          done();
        });
      });
    });

    describe('when unable to authorize', function () {
      it('passes an error to the callback', function (done) {
        credentials.client_id = 'invalid';

        var badAuthRequest = nock('https://my-eu.sapanywhere.com:443/oauth2', {
          reqheaders: { 'content-type': 'application/x-www-form-urlencoded' }
        })
          .post('/token?client_id=' + credentials.client_id +
            '&client_secret=' + credentials.client_secret +
            '&grant_type=refresh_token' +
            '&refresh_token=' + credentials.refresh_token)
          .reply(200, {
            error: 'mock_error',
            error_description: 'Mock error description',
          });

        sapHelper = new Sap(credentials);

        sapHelper.execute(options, function (err, data, status, headers) {
          expect(err.message).to.eql('Mock error description');
          expect(badAuthRequest.isDone()).to.be.true;
          done();
        });
      });
    });
  });
});

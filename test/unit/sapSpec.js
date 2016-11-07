'use strict';

var nock = require('nock');
var sinon = require('sinon');
var expect = require('chai').expect;
var Promise = require('es6-promise').Promise;
var Sap = require('../../index');
var testCredentials = require('../support/testCredentials');

describe('Sap', function () {
  this.timeout(6000);

  describe('execute', function () {
    var options,
        sapHelper,
        accessToken,
        mockToken = 'mock_token',
        expectedResult = { 'id': '1' },
        credentials = testCredentials;

    beforeEach(function () {
      options = {
        method: 'GET',
        path: 'Customers'
      };

      credentials = JSON.parse(JSON.stringify(testCredentials));
      sapHelper = new Sap(credentials);
      accessToken = sinon.stub(sapHelper.authService, 'accessToken');
      accessToken.returns(Promise.resolve('mock_token'));
    });

    afterEach(function () {
      accessToken.restore();
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
        expect(data).to.equal(1);
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
        var authError = new Error('Mock error message');
        credentials.client_id = 'invalid';

        // create new sapHelper with invalid credentials
        sapHelper = new Sap(credentials);

        // re-stub accessToken
        accessToken = sinon.stub(sapHelper.authService, 'accessToken');
        accessToken.returns(Promise.reject(authError));

        sapHelper.execute(options, function (err, data, status, headers) {
          expect(err.message).to.equal(authError.message);
          done();
        });
      });
    });
  });
});

'use strict';

var expect = require('chai').expect;
var Promise = require('es6-promise').Promise;
var Sap = require('../../index');
var credentials = require('../support/testCredentials');

describe('End-to-end tests', function () {
  this.timeout(6000);
  var sapHelper = new Sap(credentials);

  var options = {
    method: 'GET',
    path: 'Products',
    params: { expand: 'skus' }
  };

  describe('execute', function () {
    it('sends a custom GET request', function (done) {
      sapHelper.execute(options, function (err, data, status, headers) {
        if (err) return done(err);

        expect(status).to.equal(200);
        expect(headers.server).to.equal('SAP');
        expect(data.length).to.be.above(0);
        expect(data[0].skus.length).to.be.above(0);
        done();
      });
    });

    it('can execute concurrently with single authentication', function (done) {
      var executeAsPromised = function () {
        return new Promise(function(resolve, reject) {
          sapHelper.execute(options, function (err, data) {
            if (err) { reject(err); }
            else { resolve(data); }
          });
        });
      };

      Promise.all([
        executeAsPromised(),
        executeAsPromised()
      ])
        .then(function (results) {
          expect(results.length).to.equal(2);
          expect(results[0][0].skus).to.exist;
          done();
        })
        .catch(done);
    });

    it.skip('sends a custom POST request', function (done) {
      options = {
        method: 'POST',
        path: 'Customers',
        body: {
          "firstName": "Rick",
          "lastName": "Morty",
          "customerType": "INDIVIDUAL_CUSTOMER",
          "stage": "CUSTOMER",
          "status": "ACTIVE",
          "marketingStatus": "UNKNOWN"
        }
      };

      sapHelper.execute(options, function (err, data, status, headers) {
        expect(status).to.equal(201);
        expect(headers.server).to.equal('SAP');
        expect(data).to.be.above(0);
        done();
      });
    });
  });
});

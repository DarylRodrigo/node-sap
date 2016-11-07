'use strict';

var expect = require('chai').expect;
var Promise = require('es6-promise').Promise;
var Sap = require('../../index');
var credentials = require('../support/testCredentials');

describe('Sap e2e tests', function () {
  this.timeout(6000);
  var sapHelper = new Sap(credentials);

  describe('execute', function () {
    var options = {
      method: 'GET',
      path: 'Products',
      params: { expand: 'skus' }
    };

    describe('GET', function () {
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
              if (err) reject(err);
              else resolve(data);
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
    });

    /* * * * * * * * * * * * * * * * * * * * * * * *
    The following tests modify the live SAP API.
    To run them, remove the `.skip` on the next line
    * * * * * * * * * * * * * * * * * * * * * * * */
    describe.skip('POST', function () {
      it('sends a custom POST request', function (done) {
        options = {
          method: 'POST',
          path: 'Customers',
          body: {
            firstName: "Rick",
            lastName: "Morty",
            customerType: "INDIVIDUAL_CUSTOMER",
            stage: "CUSTOMER",
            status: "ACTIVE",
            marketingStatus: "UNKNOWN"
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

    describe.skip('PUT/PATCH', function () {
      // TODO: write PUT test
    });
  });
});

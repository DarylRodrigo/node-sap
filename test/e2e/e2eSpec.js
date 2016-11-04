'use strict';

var expect = require('chai').expect;
var Promise = require('es6-promise').Promise;
var chai = require("chai")
var chaiAsPromised = require('chai-as-promised');
var sampleCustomer = require('../support/sampleCustomer');

chai.use(chaiAsPromised);
chai.should();

var Sap = require('../../index');
var credentials = require('../support/testCredentials');

describe('End-to-end tests', function () {
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
    });

    /* * * * * * * * * * * * * * * * * * * * * * * *
    The following tests modify the live SAP API.
    To run them, remove the `.skip` on the next line
    * * * * * * * * * * * * * * * * * * * * * * * */
    describe('POST', function () {
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
  });

  describe('Resource', function () {
    this.timeout(60000);
    var Customer = sapHelper.createResource("Customers");

    it('should be able to create a resource', function (done) {
      sampleCustomer.email = new Date().getTime() + "@pi-top.com";

      Customer.create(sampleCustomer)
      .then( function(_customerId) {
        _customerId.should.to.be.a("number");
        sampleCustomer.id = _customerId;
        done();
      })
      .catch ( function(error) {
        done(error);
      });
    });

    it('should be able to find all of a resource', function (done) {
      Customer.findAll()
      .then( function(_customers) {
        _customers.length.should.to.be.a("number")
        done();
      })
      .catch ( function(error) {
        done(error);
      });
    });

    it('should be able to find all of a resource with filter', function (done) {
      var filter = "id eq " + sampleCustomer.id
      Customer.findAll(filter)
      .then( function(_customers) {
        _customers[0].id.should.equal(sampleCustomer.id)
        done();
      })
      .catch ( function(error) {
        done(error);
      });
    });

    it('should be able to find resource by id', function (done) {
      Customer.findById(sampleCustomer.id)
      .then( function(_customer) {
        _customer.id.should.equal(sampleCustomer.id)
        done();
      })
      .catch ( function(error) {
        done(error);
      });
    });

    it('should be able to find update resource by id', function (done) {
      var body = {"firstName": "lol"}
      Customer.updateById(sampleCustomer.id, body)
      .then( function(_customer) {
        return Customer.findById(sampleCustomer.id);
      })
      .then( function(_customer) {
        _customer.firstName.should.equal("Lol")
        done();
      })
      .catch ( function(error) {
        done(error);
      });
    });

  });

});

'use strict';

var chai = require("chai")
var chaiAsPromised = require('chai-as-promised');
var credentials = require('../support/testCredentials');
var sampleCustomer = require('../support/sampleCustomer');
var Sap = require('../../index');

chai.use(chaiAsPromised);
chai.should();

describe('Resource e2e tests', function () {
  this.timeout(60000);

  var sapHelper = new Sap(credentials),
      Customer;

  beforeEach(function () {
    Customer = sapHelper.createResource("Customers");
  });

  describe('create', function () {
    it('creates a resource', function (done) {
      sampleCustomer.email = new Date().getTime() + "@pi-top.com";

      Customer.create(sampleCustomer)
        .then(function(_customerId) {
          _customerId.should.be.a("number");
          sampleCustomer.id = _customerId;
          done();
        })
        .catch(done);
    });
  });

  describe('findAll', function () {
    it('finds all instances of a resource', function (done) {
      Customer.findAll()
        .then(function(_customers) {
          _customers.length.should.be.a("number");
          done();
        })
        .catch(done);
    });

    it('finds all instances of a resource with a filter', function (done) {
      var filter = "id eq " + sampleCustomer.id;

      Customer.findAll(filter)
        .then(function(_customers) {
          _customers[0].id.should.equal(sampleCustomer.id)
          done();
        })
        .catch(done);
    });
  });

  describe('findById', function () {
    it('finds a resource by id', function (done) {
      Customer.findById(sampleCustomer.id)
        .then(function(_customer) {
          _customer.id.should.equal(sampleCustomer.id)
          done();
        })
        .catch(done);
    });
  });

  /* * * * * * * * * * * * * * * * * * * * * * * *
  The following tests modify the live SAP API.
  To run them, remove the `.skip` on the next line
  * * * * * * * * * * * * * * * * * * * * * * * */

  describe.skip('updateById', function () {
    it('updates a resource by id', function (done) {
      var body = {"firstName": "lol"};

      Customer.updateById(sampleCustomer.id, body)
        .then(function() {
          return Customer.findById(sampleCustomer.id);
        })
        .then( function(_customer) {
          _customer.firstName.should.equal("Lol");
          done();
        })
        .catch(done);
    });
  });
});

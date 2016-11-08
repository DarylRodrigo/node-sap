'use strict';

var expect = require("chai").expect;
var credentials = require('../support/testCredentials');
var sampleCustomer = require('../support/sampleCustomer');
var Sap = require('../../index');

describe('Resource e2e tests', function () {
  this.timeout(6000);

  var sapHelper = new Sap(credentials),
      Customer;

  beforeEach(function () {
    Customer = sapHelper.createResource("Customers");
  });

  describe('create', function () {
    it('creates a resource', function (done) {
      sampleCustomer.email = new Date().getTime() + '@pi-top.com';

      Customer.create(sampleCustomer)
        .then(function(_customerId) {
          expect(_customerId).to.be.a('number');
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
          expect(_customers.length).to.be.a('number');
          done();
        })
        .catch(done);
    });

    it('finds all instances of a resource with a filter', function (done) {
      var filter = "id eq " + sampleCustomer.id;

      Customer.findAll(filter)
        .then(function(_customers) {
          expect(_customers[0].id).to.equal(sampleCustomer.id);
          done();
        })
        .catch(done);
    });
  });

  describe('findById', function () {
    it('finds a resource by id', function (done) {
      Customer.findById(sampleCustomer.id)
        .then(function(_customer) {
          expect(_customer.id).to.equal(sampleCustomer.id);
          done();
        })
        .catch(done);
    });
  });

  describe('updateById', function () {
    it('updates a resource by id', function (done) {
      var body = {"firstName": "lol"};

      Customer.updateById(sampleCustomer.id, body)
        .then(function() {
          return Customer.findById(sampleCustomer.id);
        })
        .then( function(_customer) {
          expect(_customer.firstName).to.equal("Lol");
          done();
        })
        .catch(done);
    });
  });
});

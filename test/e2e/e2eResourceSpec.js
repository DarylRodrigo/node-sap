'use strict';

var chai = require("chai")
var nock = require('nock');
var chaiAsPromised = require('chai-as-promised');
var credentials = require('../support/testCredentials');
var sampleCustomer = require('../support/sampleCustomer');
var Sap = require('../../index');

chai.use(chaiAsPromised);
chai.should();

describe('Resource', function () {
  this.timeout(60000);

  var sapHelper = new Sap(credentials);
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

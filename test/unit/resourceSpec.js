'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var Resource = require('../../services/resourceService');

chai.use(sinonChai);

describe('resource', function () {
  var resource,
      resourceName = 'testResource',
      sapHelper = {
        execute: function () {}
      },
      options,
      execute;

  beforeEach(function () {
    options = {};
    resource = new Resource(resourceName, sapHelper, options);
  });

  describe('initialization', function () {
    it('sets the resource name and injects sapHelper', function () {
      expect(resource.resourceName).to.equal(resourceName);
      expect(resource.sapHelper).to.equal(sapHelper);
    });

    it('sets the cache to false by default', function () {
      expect(resource.isCaching).to.be.false;
    });

    describe('when passed cache options', function () {
      it('sets the cache', function () {
        options = {isCaching: true};

        resource = new Resource(resourceName, sapHelper, options);

        expect(resource.isCaching).to.be.true;
        expect(resource.cache).to.exist;
      });
    });
  });

  describe('create', function () {
    var requestBody,
        expectedReqArgs;

    beforeEach(function () {
      requestBody = {};
      expectedReqArgs = {
        method: 'POST',
        path: resourceName,
        body: requestBody
      };

      execute = sinon.stub(resource.sapHelper, 'execute');
      execute.withArgs(expectedReqArgs).yields(null, 1, 201);
    });

    afterEach(function () {
      execute.restore();
    });

    it('executes a POST request', function (done) {
      resource.create(requestBody)
        .then(function () {
          expect(execute).to.have.been.calledWith(expectedReqArgs);
          done();
        })
        .catch(done);
    });

    it('returns a promise that resolves with a resource id', function (done) {
      resource.create({})
        .then(function (_resourceId) {
          expect(_resourceId).to.be.a.number;
          done();
        })
        .catch(done);
    });
  });
});

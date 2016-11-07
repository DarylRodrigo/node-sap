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
      sapHelper = {},
      options;

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
        options = {
          isCaching: true,
          cacheTime: 100,
          stdTTL: 200
        };

        resource = new Resource(resourceName, sapHelper, options);

        expect(resource.isCaching).to.be.true;
        expect(resource.cache).to.exist;
      });
    });
  });
});

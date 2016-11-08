'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var Resource = require('../../services/resource');

chai.use(sinonChai);

describe('resource', function () {
  var resource,
      resourceName = 'testResource',
      sapHelper = {
        execute: function () {}
      },
      requestParams,
      options,
      execute;

  beforeEach(function () {
    options = {};
    resource = new Resource(resourceName, sapHelper, options);
    execute = sinon.stub(resource.sapHelper, 'execute');
  });

  afterEach(function () {
    execute.restore();
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
    var requestBody;

    beforeEach(function () {
      requestBody = {};
      requestParams = {
        method: 'POST',
        path: resourceName,
        body: requestBody
      };

      execute.withArgs(requestParams).yields(null, 1, 201);
    });

    it('executes a POST request', function (done) {
      resource.create(requestBody)
        .then(function () {
          expect(execute).to.have.been.calledWith(requestParams);
          done();
        })
        .catch(done);
    });

    it('resolves with the created resource id', function (done) {
      resource.create({})
        .then(function (_resourceId) {
          expect(_resourceId).to.be.a.number;
          done();
        })
        .catch(done);
    });

    describe('when an error occurs during the request', function () {
      it('rejects with an error', function (done) {
        var sampleError = new Error('Sample error description');

        execute.withArgs(requestParams).yields(sampleError);

        resource.create(requestBody)
          .then(function () {
            throw new Error('Promise resolved instead of rejecting');
          })
          .catch(function (err) {
            expect(err.message).to.equal(sampleError.message);
            done();
          });
      });
    });

    describe('when the request returns a 400 status or above', function () {
      it('rejects with an error', function (done) {
        var statusError = new Error('404 error: sample error message');

        execute.withArgs(requestParams)
          .yields(
            null,
            {errorCode: 12345, message: 'sample error message'},
            404
          );

        resource.create(requestBody)
          .then(function () {
            throw new Error('Promise resolved instead of rejecting');
          })
          .catch(function (err) {
            expect(err.message).to.equal(statusError.message);
            done();
          });
      });
    });
  });

  describe('findAll', function () {
    var expectedResult = [{id: 1}, {id: 2}, {id: 3}];

    beforeEach(function () {
      requestParams = {
        method: 'GET',
        path: resourceName
      };

      resource.isCaching = false;
      execute.withArgs(requestParams).yields(null, expectedResult, 200);
    });

    it('executes a GET request', function (done) {
      resource.findAll()
        .then(function () {
          expect(execute).to.have.been.calledWith(requestParams);
          done();
        });
    });

    it('resolves with an array of resources', function (done) {
      resource.findAll()
        .then(function (resources) {
          expect(resources.length).to.be.above(0);
          expect(resources[0].id).to.equal(1);
          done();
        });
    });

    describe('when an error occurs during the request', function () {
      it('rejects with an error', function (done) {
        var sampleError = new Error('Sample error description');

        execute.withArgs(requestParams).yields(sampleError);

        resource.findAll()
          .then(function () {
            throw new Error('Promise resolved instead of rejecting');
          })
          .catch(function (err) {
            expect(err.message).to.equal(sampleError.message);
            done();
          });
      });
    });

    describe('when the request returns a 400 status or above', function () {
      it('rejects with an error', function (done) {
        var statusError = new Error('404 error: sample error message');

        execute.withArgs(requestParams)
          .yields(
            null,
            {errorCode: 12345, message: 'sample error message'},
            404
          );

        resource.findAll()
          .then(function () {
            throw new Error('Promise resolved instead of rejecting');
          })
          .catch(function (err) {
            expect(err.message).to.equal(statusError.message);
            done();
          });
      });
    });

    describe('when caching is active', function () {
      var cacheGet,
          cacheSet;

      beforeEach(function () {
        resource.isCaching = true;
        resource.cache = {
          get: function () {},
          set: function () {}
        };

        cacheGet = sinon.stub(resource.cache, 'get');
        cacheSet = sinon.stub(resource.cache, 'set');
      });


      describe('when the resource is already in cache', function () {
        it('resolves with the cached value', function (done) {
          cacheGet.withArgs(resourceName).yields(null, expectedResult);

          resource.findAll()
            .then(function (resources) {
              expect(cacheGet).to.have.been.calledWith(resourceName);
              expect(resources).to.equal(expectedResult);
              done();
            })
            .catch(done);
        });
      });

      describe('when the resource is not already in cache', function () {
        beforeEach(function () {
          cacheGet.withArgs(resourceName).yields(null, undefined);
        });

        it('executes a GET request', function (done) {
          resource.findAll()
            .then(function (resources) {
              expect(execute).to.have.been.calledWith(requestParams);
              expect(resources).to.equal(expectedResult);
              done();
            })
            .catch(done);
        });

        it('sets the request result to cache', function (done) {
          resource.findAll()
            .then(function (resources) {
              expect(cacheSet).to.have.been.calledWith(resourceName, resources);
              done();
            })
            .catch(done);
        });

        describe('when a filter is passed as an argument', function () {
          it('executes the request with a filter param', function (done) {
            var filter = 'id eq 1';
            requestParams.params = { 'filter': filter };

            resource.findAll(filter)
            .then(function () {
              expect(execute).to.have.been.calledWith(requestParams);
              done();
            })
            .catch(done);
          });
        });

        describe('when an error occurs during the request', function () {
          it('rejects with an error', function (done) {
            var sampleError = new Error('Sample error description');

            execute.withArgs(requestParams).yields(sampleError);

            resource.findAll()
              .then(function () {
                throw new Error('Promise resolved instead of rejecting');
              })
              .catch(function (err) {
                expect(err.message).to.equal(sampleError.message);
                done();
              });
          });
        });

        describe('when the request returns a 400 status or above', function () {
          it('rejects with an error', function (done) {
            var statusError = new Error('404 error: sample error message');

            execute.withArgs(requestParams)
              .yields(
                null,
                {errorCode: 12345, message: 'sample error message'},
                404
              );

            resource.findAll()
              .then(function () {
                throw new Error('Promise resolved instead of rejecting');
              })
              .catch(function (err) {
                expect(err.message).to.equal(statusError.message);
                done();
              });
          });
        });
      });
    });
  });

  describe('findById', function () {
    var id = 1;
    var expectedResult = {id: id};

    beforeEach(function () {
      requestParams = {
        method: 'GET',
        path: resourceName + '/' + id
      };

      execute.withArgs(requestParams).yields(null, expectedResult, 200);
    });

    it('executes a GET request', function (done) {
      resource.findById(id)
        .then(function () {
          expect(execute).to.have.been.calledWith(requestParams);
          done();
        });
    });

    it('resolves with a resource', function (done) {
      resource.findById(id)
        .then(function (resource) {
          expect(resource.id).to.equal(id);
          done();
        });
    });

    describe('when a filter is passed as an argument', function () {
      it('executes the request with a filter param', function (done) {
        var filter = 'id eq 1';
        requestParams.params = { 'filter': filter };

        resource.findById(id, filter)
        .then(function () {
          expect(execute).to.have.been.calledWith(requestParams);
          done();
        })
        .catch(done);
      });
    });

    describe('when an error occurs during the request', function () {
      it('rejects with an error', function (done) {
        var sampleError = new Error('Sample error description');

        execute.withArgs(requestParams).yields(sampleError);

        resource.findById(id)
          .then(function () {
            throw new Error('Promise resolved instead of rejecting');
          })
          .catch(function (err) {
            expect(err.message).to.equal(sampleError.message);
            done();
          });
      });
    });

    describe('when the request returns a 400 status or above', function () {
      it('rejects with an error', function (done) {
        var statusError = new Error('404 error: sample error message');

        execute.withArgs(requestParams)
          .yields(
            null,
            {errorCode: 12345, message: 'sample error message'},
            404
          );

        resource.findById(id)
          .then(function () {
            throw new Error('Promise resolved instead of rejecting');
          })
          .catch(function (err) {
            expect(err.message).to.equal(statusError.message);
            done();
          });
      });
    });
  });

  describe('updateById', function () {
    var id = 1;
    var expectedResult = id;
    var body = {
      customerName: "Uncle Bob"
    };

    beforeEach(function () {
      requestParams = {
        method: 'PATCH',
        path: resourceName + '/' + id,
        body: body
      };

      execute.withArgs(requestParams).yields(null, expectedResult, 200);
    });

    it('executes a GET request', function (done) {
      resource.updateById(id, body)
        .then(function () {
          expect(execute).to.have.been.calledWith(requestParams);
          done();
        });
    });

    it('resolves with a resource', function (done) {
      resource.updateById(id, body)
        .then(function (_id) {
          expect(_id).to.equal(id);
          done();
        });
    });

    describe('when an error occurs during the request', function () {
      it('rejects with an error', function (done) {
        var sampleError = new Error('Sample error description');

        execute.withArgs(requestParams).yields(sampleError);

        resource.updateById(id, body)
          .then(function () {
            throw new Error('Promise resolved instead of rejecting');
          })
          .catch(function (err) {
            expect(err.message).to.equal(sampleError.message);
            done();
          });
      });
    });

    describe('when the request returns a 400 status or above', function () {
      it('rejects with an error', function (done) {
        var statusError = new Error('404 error: sample error message');

        execute.withArgs(requestParams)
          .yields(
            null,
            {errorCode: 12345, message: 'sample error message'},
            404
          );

        resource.updateById(id, body)
          .then(function () {
            throw new Error('Promise resolved instead of rejecting');
          })
          .catch(function (err) {
            expect(err.message).to.equal(statusError.message);
            done();
          });
      });
    });
  });
});

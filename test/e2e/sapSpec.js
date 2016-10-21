var expect = require('chai').expect;
var Promise = require('es6-promise').Promise;
var credentials = require('../../auth.json');
var sap = require('../../index')(credentials);

describe('End-to-end tests', function () {
  this.timeout(6000);
  var options = {
    method: 'GET',
    path: 'Products',
    params: { expand: 'skus' }
  };

  describe('execute', function () {
    it('sends custom HTTP requests', function (done) {
      sap.execute(options, function (err, data) {
        if (err) return done(err);

        expect(data.length).to.be.above(0);
        expect(data[0].skus.length).to.be.above(0);
        done();
      });
    });

    it('can execute concurrently with single authentication', function (done) {
      var executeAsPromised = function () {
        return new Promise(function(resolve, reject) {
          sap.execute(options, function (err, data) {
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
    })
  });
});

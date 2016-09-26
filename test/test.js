'use strict';

var auth = require('./auth.json');
var expect = require('chai').expect;
var should = require('chai').should();

var sap = require('../index')(auth);

describe('Access Token', function() {
    this.timeout(30000);

    it('Should create authentication token', function(done) {
        setTimeout(function() {
            should.exist(sap.access_token);
            done();
        }, 1000)
    });

    
});

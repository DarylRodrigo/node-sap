'use strict';

var auth = require('./auth.json');
var sinon = require('sinon');
var expect = require('chai').expect;
var should = require('chai').should();
var request = require('request');

var sap = require('../index')(auth);

describe('getAccessToken', function() {
  var postRequest;

  beforeEach(function () {
    postRequest = sinon.stub(request, 'post');
  });

  afterEach(function () {
    postRequest.restore();
  });

  it('sends a POST request', function() {
    sap.getAccessToken();

    sinon.assert.calledOnce(postRequest);
  });
});

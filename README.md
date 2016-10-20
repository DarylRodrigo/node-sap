# node-sap [![CircleCI](https://circleci.com/gh/DarylRodrigo/node-sap/tree/master.svg?style=svg)](https://circleci.com/gh/DarylRodrigo/node-sap/tree/master)

A small wrapper library to easily use SAP Anywhere's API

## Installation

```sh
$ npm install node-sap
```

You must add authentication credentials in order to use the module and run tests. To do so, modify the `auth.json` file in the root folder with your SAP API credentials:
```json
// auth.json
{
  "client_id": "1234",
  "client_secret": "1234",
  "refresh_token": "1234"
}
```

## Usage

Include the following line at the top of your file, where `credentials` points to your API credentials as described in **Installation**:

```
var credentials = require('./auth.json`);
var sap = require('node-sap')(credentials);
```

The module exposes a single public `execute` method that allows you to send requests to the SAP Anywhere API. The function will automatically fetch an access token based on your credentials as described in **Installation**.

The `execute` method takes two parameters, an options object and a callback.
The options object can contain the following properties:
* the request method (as a `String`) (required)
* the API path (as a `String`) (required)
* request parameters (as an `Object`)
* request body (as an `Object`)

The `execute` method passes two arguments to the handler callback:
* An Error object
* An object with the response results

For example, to fetch a list of all customers:
```js
sap.execute('GET', '/Customers', {}, function(err, data) {
  // Asynchronously handle error or success
}
```

#### Before `v1.0.0`

The `execute()` method passed three arguments to the handler callback instead of two:
* An Error object
* The HTTP response (as `JSON`)
* The HTTP body (as `JSON`)

#### Before `v2.0.0`

The `execute` method took four parameters instead of two:
* the request method (as a `String`)
* the API path (as a `String`)
* request body parameters (as an `Object`)
* a handler callback

## Tests

Tests use the [mocha](https://github.com/mochajs/mocha) framework, [chai](https://github.com/chaijs/chai) for BDD-style assertions, [nock](https://github.com/node-nock/nock) for mocking HTTP requests, and [sinon](https://github.com/sinonjs/sinon) for mocks, stubs and spies.

NOTE: integration testing will only work once you have supplied API credentials as described in **Installation**. Once you have done this, you can switch on integration tests by removing the `x` at the start of the tests (see comment in `test/integrationTests.js`).

```sh
# Run all tests
$ `npm test`

# Run unit tests only
$ `npm run unit-tests`

# Run integration tests only
$ `npm run integration-tests`
```

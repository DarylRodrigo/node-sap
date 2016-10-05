# node-sap [![CircleCI](https://circleci.com/gh/DarylRodrigo/sap/tree/master.svg?style=svg)](https://circleci.com/gh/DarylRodrigo/sap/tree/master)

A small wrapper library to easily use SAP's API

## Installation

```sh
$ npm install node-sap
```

You must add authentication credentials in order to use the module and run tests. To do so, modify the `auth.json` file in the root folder with your SAP API credentials as follows:
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

`var sap = require('sap')(credentials);`

## Tests

Tests use the [mocha](https://github.com/mochajs/mocha) framework, [chai](https://github.com/chaijs/chai) for BDD-style assertions, [nock](https://github.com/node-nock/nock) for mocking HTTP requests, and [sinon](https://github.com/sinonjs/sinon) for mocking.

NOTE: integration testing will only work once you have supplied API credentials as described in **Installation**. Once you have done this, you can switch on integration tests by removing the `x` at the start of the tests (see comment in `test/integrationTests.js`).

```sh
# Run all tests
$ `npm test`

# Run unit tests only
$ `npm run unit-tests`

# Run integration tests only
$ `npm run integration-tests`
```

SAP API wrapper
[![CircleCI](https://circleci.com/gh/DarylRodrigo/sap/tree/master.svg?style=svg)](https://circleci.com/gh/DarylRodrigo/sap/tree/master)

A small library to easily use SAP's API

## Installation

```sh
$ git clone https://github.com/DarylRodrigo/sap.git
$ cd sap
$ npm install
```

You must add authentication credentials in order to use the module and run tests. To do so, add an `auth.json` file to the root folder with your API credentials as follows:
```json
{
  "client_id": "1234567-ABCD123",
  "client_secret": "ABCED-12345",
  "refresh_token": "1a2b3c4d5e"
}
```

## Usage

Include the following line at the top of your file, where `credentials` points to your API credentials as described in **Installation**:

`var sap = require('sap')(credentials);`

## Tests

Tests use the [mocha](https://github.com/mochajs/mocha) framework, [chai](https://github.com/chaijs/chai) for BDD-style assertions, [nock](https://github.com/node-nock/nock) for mocking HTTP requests, and [sinon](https://github.com/sinonjs/sinon) for mocking. You can run unit tests and integration tests separately with the following commands:

```sh
# Run all tests
$ `npm test`

# Run unit tests
$ `npm run unit-tests`

# Run integration tests
$ `npm run integration-tests`
```

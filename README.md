# node-sap [![CircleCI](https://circleci.com/gh/DarylRodrigo/node-sap/tree/master.svg?style=svg)](https://circleci.com/gh/DarylRodrigo/node-sap/tree/master)

A small wrapper library to easily use SAP Anywhere's API

## Installation

```sh
$ npm install node-sap
```

## Usage

Include the following lines at the top of your file, where `credentials` points to a JSON file containing your SAP API credentials (see example below):

```js
// app.js
var credentials = require('./auth.json');
var sap = require('node-sap')(credentials);

// auth.json
{
  "client_id": "1234",
  "client_secret": "1234",
  "refresh_token": "1234"
}
```

The module exposes a single public `execute` method that allows you to send requests to the SAP Anywhere API. The function will automatically fetch an access token based on your credentials.

The `execute` method takes two parameters, an options object and a callback.
The options object can contain the following properties:

* a request method `String` (**required**)
* an API path `String` (**required**)
* a request parameters `Object`
* a request body `Object`

The `execute` method passes two arguments to the handler callback:
* An Error object
* An object with the response results

#### Example: `GET` request

For example, to fetch a list of all products and expand their skus:

```js
var options = {
  method: 'GET',
  path: '/Products',
  params: {
    expand: 'skus'
  },
  body: {}
};

sap.execute(options, function(err, data) {
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

You must add authentication credentials in order to run end-to-end tests. To do so, modify the `testCredentials.json` file in the `tests/support` folder with your SAP API credentials.

**NOTE:** the end-to-end tests purposefully hit the live SAP API, but only execute `GET` requests.

```sh
# Run unit tests
$ `npm test`

# Run e2e tests
$ `npm run e2e-tests`
```

Tests use the [mocha](https://github.com/mochajs/mocha) framework, [chai](https://github.com/chaijs/chai) for BDD-style assertions, [nock](https://github.com/node-nock/nock) for mocking HTTP requests, and [sinon](https://github.com/sinonjs/sinon) for mocks, stubs and spies.

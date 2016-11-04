# node-sap [![CircleCI](https://circleci.com/gh/DarylRodrigo/node-sap/tree/master.svg?style=svg)](https://circleci.com/gh/DarylRodrigo/node-sap/tree/master)

A small wrapper library to easily use SAP Anywhere's API

* [Installation](#installation)
* [Usage](#usage)
* [Changelog](#changelog)
* [Tests](#tests)

## Installation

```sh
$ npm install node-sap
```

## Usage

Include the following lines at the top of your file, where `credentials` points to a JSON file containing your SAP API credentials (see example below):

```js
// app.js
var sapHelper = require('node-sap');
var credentials = require('./auth');

var sap = new sapHelper(credentials);

// auth.json
{
  "client_id": "123456789",
  "client_secret": "123456789",
  "refresh_token": "123456789"
}
```

#### `Creating resources`

For your convenience the module creates resources which have the standard CRUD methods (minus the D, as sap doesnt allow you to delete objects). In order to create a resource, instantiate the module and use the `createResource` function to return a class which all the methods associated with it. Note that promises are returned from the resource creator. Also added in this module is the ability to cache resources (**only applied to findAll method**) - by setting the cached option as true you can enable this option, see example below.

#### Example: Creating a `Customer` Resource

For example, to instantiate a Customer resource.

```
var sap = new sapHelper(credentials);
var Customer = sap.createResource("Customers");
```

#### Example: Using a resource to create an instance of said resource

```
Customer.create(body)
.then( function (_id) {
    // do something with id
})
.catch( function (err) {
    // handle error
})
```

#### Example: finding all resources with email of "example@sap.com"

```
var filter = "id eq 'example@sap.co'"
Customer.findll(filter)
.then( function (_id) {
    // do something with id
})
.catch( function (err) {
    // handle error
})
```

List of functions - note that the filter parameter is optional

`Customer.create(body)`

`Customer.findAll(filter)`

`Customer.findById(id, filter)`

`Customer.updateById(id, body)`

a more extensive list of filters can be found [here](https://doc-eu.sapanywhere.com/api/spec/query)

#### Example: caching a resource
Use the `stdTTL` and `checkPeriod` in order to set how long you want the cache to last. Please make sure you set cache to true if you want to enable caching.

```
var Customer = sapHelper.createResource("Customers", {cache:true, stdTTL: 1, checkPeriod: 1});
```

#### `execute()`

The module also exposes a public `execute` method that allows you to send requests to the SAP Anywhere API. The function will automatically fetch an access token based on your credentials.

The `execute` method takes two parameters, an options object and a callback.
The options object can contain the following properties:

* a request method `String` (**required**)
* an API path `String` (**required**)
* a request parameters `Object`
* a request body `Object`

The `execute` method passes four arguments to the handler callback:
* an `Error` object
* a `data` object with the response results
* a `status` code integer
* a `headers` object

#### Example: `GET` request

For example, to fetch a list of all products and expand their skus:

```js
var options = {
  method: 'GET',
  path: '/Products',
  params: {
    expand: 'skus'
  }
};

sap.execute(options, function(err, data, status, headers) {
  // Asynchronously handle error or success
}
```

#### Example: `POST` request

For example, to POST a new Customer:

```js
var options = {
  method: 'POST',
  path: '/Customers',
  body: {
    firstName: 'John',
    lastName: 'Doe',
    // ...
  }
};

sap.execute(options, function(err, data, status, headers) {
  // Asynchronously handle error or success
}
```

## Changelog

#### Versions `< 3.0.0`

* The module was initialized when importing:
```js
// app.js
var credentials = require('./auth');
var sap = require('node-sap')(credentials);
```
* The execute function only returned `error` and `status` objects

#### Versions `< 2.0.0`

`execute()` took four parameters instead of two:
* the request method (as a `String`)
* the API path (as a `String`)
* request body parameters (as an `Object`)
* a handler callback

#### Versions `< 1.0.0`

`execute()` passed three arguments to the handler callback instead of two:
* An Error object
* The HTTP response (as `JSON`)
* The HTTP body (as `JSON`)

## Tests

You must add authentication credentials in order to run end-to-end tests. To do so, modify the `testCredentials.json` file in the `tests/support` folder with your SAP API credentials.

```sh
# Run unit tests
$ `npm test`

# Run e2e tests
$ `npm run e2e-tests`
```

**NOTE:** the end-to-end tests purposefully hit the live SAP API, but only execute `GET` requests. Additional tests that perform other CRUD operations on the live API are skipped by default. You can change this by removing `.skip` (see comment in `test/e2e/e2eSpec.js`).

Tests use the [mocha](https://github.com/mochajs/mocha) framework, [chai](https://github.com/chaijs/chai) for BDD-style assertions, [nock](https://github.com/node-nock/nock) for mocking HTTP requests, and [sinon](https://github.com/sinonjs/sinon) for mocks, stubs and spies.
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

Unit and integration tests should be run separately to avoid conflicts with mocked HTTP requests using [nock](https://github.com/node-nock/nock):

```sh
# Run unit tests
$ `npm test`
# or
$ `npm run unit-tests`

# Run integration tests
$ `npm run integration-tests`
```

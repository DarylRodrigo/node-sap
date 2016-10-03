SAP API wrapper
=========
[![CircleCI](https://circleci.com/gh/DarylRodrigo/sap/tree/master.svg?style=svg)](https://circleci.com/gh/DarylRodrigo/sap/tree/master)

A small library to easily use SAP's API

## Installation

```sh
$ git clone https://github.com/DarylRodrigo/sap.git
$ cd sap
$ npm install
```

## Usage

Include the following line at the top of your file:

`var sap = require('sap')(options)`

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

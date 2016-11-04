'use strict';

var Promise = require('es6-promise').Promise;
var AuthService = require('./authService');
var request = require('request');

function SapRequest(credentials) {
	this.credentials = credentials;

	this.httpUri = 'https://api-eu.sapanywhere.com:443';
	this.version = 'v1';

	this.authService = new AuthService(this.credentials);
}

SapRequest.prototype.execute= function (args, callback) {
	var that = this;
	var requestParams = formatParams(args.params);

	return new Promise(function (resolve, reject) {

		that.authService.tokenPromise
		.then(function (tokenData) {
			var options = {
				method: args.method,
				url: that.httpUri + '/' + that.version + '/' + args.path
					+ '?' + requestParams + 'access_token=' + tokenData.access_token,
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify(args.body),
			};

			console.log(options)

			request(options, function (err, res, body) {
				console.log(body)
				var data;

				if (body) { data = JSON.parse(body); }

				if (!err && res.statusCode >= 400) {
					err = new Error(res.statusCode + ' error' +
						(data && data.errorCode ? ': ' + data.message : ''));
				}

				return callback(err, data, res.statusCode, res.headers);
			});
		})
		.catch(function (error) {
			return callback(error);
		});
	});
}

function formatParams(params) {
	var requestParams = '';

	for (var key in params) {
		if (params.hasOwnProperty(key)) {
			requestParams += key + '=' + params[key] + '&';
		}
	}

	return requestParams;
}

module.exports = SapRequest;
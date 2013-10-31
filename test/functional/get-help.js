/* jshint maxlen: false, maxstatements: false */
/* global before, describe, it */
'use strict';

var assert = require('proclaim');
var runPa11y = require('./helper/run-pa11y');

describe('pa11y --help', function () {

	before(function (done) {
		var that = this;
		runPa11y('--help', function (err, result) {
			that.result = result;
			done();
		});
	});

	it('should be successful', function () {
		assert.isNull(this.result.err);
	});

	it('should output usage information', function () {
		assert.match(this.result.stdout, /usage/i);
		assert.match(this.result.stdout, /options/i);
	});

});

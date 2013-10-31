/* jshint maxlen: false, maxstatements: false */
/* global before, describe, it */
'use strict';

var assert = require('proclaim');
var runPa11y = require('./helper/run-pa11y');

describe('pa11y --timeout 200 http://localhost:4117/normal', function () {

	before(function (done) {
		var that = this;
		runPa11y('--timeout 200 http://localhost:4117/normal', function (err, result) {
			that.result = result;
			done();
		});
	});

	it('should not be successful', function () {
		assert.isNotNull(this.result.err);
	});

	it('should output the expected error message', function () {
		assert.match(this.result.stderr, /phantomjs timeout/i);
	});

});

describe('pa11y --timeout foo http://localhost:4117/normal', function () {

	before(function (done) {
		var that = this;
		runPa11y('--timeout foo http://localhost:4117/normal', function (err, result) {
			that.result = result;
			done();
		});
	});

	/*it('should not be successful', function () {
		assert.isNotNull(this.result.err);
	});*/

	it('should output usage information', function () {
		assert.match(this.result.stdout, /usage/i);
		assert.match(this.result.stdout, /options/i);
	});

});

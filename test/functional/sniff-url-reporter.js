/* jshint maxlen: false, maxstatements: false */
/* global before, describe, it */
'use strict';

var assert = require('proclaim');
var runPa11y = require('./helper/run-pa11y');

describe('pa11y --reporter json http://localhost:4117/normal', function () {

	before(function (done) {
		var that = this;
		runPa11y('--reporter json http://localhost:4117/normal', function (err, result) {
			that.result = result;
			done();
		});
	});

	it('should be successful', function () {
		assert.isNull(this.result.err);
	});

	it('should output valid JSON', function () {
		assert.doesNotThrow(JSON.parse.bind(JSON, this.result.stdout));
	});

	it('should output the expected messages', function () {
		assert.match(this.result.stdout, /check that the title element/i);
		assert.match(this.result.stdout, /alt text serves the same purpose/i);
	});

});

describe('pa11y --reporter foo http://localhost:4117/normal', function () {

	before(function (done) {
		var that = this;
		runPa11y('--reporter foo http://localhost:4117/normal', function (err, result) {
			that.result = result;
			done();
		});
	});

	it('should not be successful', function () {
		assert.isNotNull(this.result.err);
	});

	it('should output the expected error message', function () {
		assert.match(this.result.stderr, /reporter foo not found/i);
	});

});

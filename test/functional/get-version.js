/* jshint maxlen: false, maxstatements: false */
/* global before, describe, it */
'use strict';

var assert = require('proclaim');
var pkg = require('../../package.json');
var runPa11y = require('./helper/run-pa11y');

describe('pa11y --version', function () {

	before(function (done) {
		var that = this;
		runPa11y('--version', function (err, result) {
			that.result = result;
			done();
		});
	});

	it('should be successful', function () {
		assert.isNull(this.result.err);
	});

	it('should output the current version', function () {
		assert.strictEqual(this.result.stdout, pkg.version);
	});

});

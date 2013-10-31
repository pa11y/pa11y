/* jshint maxlen: false, maxstatements: false */
/* global before, describe, it */
'use strict';

var assert = require('proclaim');
var pkg = require('../../package.json');
var runPa11y = require('./helper/run-pa11y');

describe('pa11y http://localhost:4117/normal (no useragent specified)', function () {

	before(function (done) {
		var that = this;
		runPa11y('http://localhost:4117/normal', function (err, result) {
			that.result = result;
			done();
		});
	});

	it('should be successful', function () {
		assert.isNull(this.result.err);
	});

	it('should use the useragent "pa11y/' + pkg.version + '"', function () {
		assert.strictEqual(this.site.lastUseragent, 'pa11y/' + pkg.version);
	});

});

describe('pa11y --useragent foo http://localhost:4117/normal', function () {

	before(function (done) {
		var that = this;
		runPa11y('--useragent foo http://localhost:4117/normal', function (err, result) {
			that.result = result;
			done();
		});
	});

	it('should be successful', function () {
		assert.isNull(this.result.err);
	});

	it('should use the useragent "foo"', function () {
		assert.strictEqual(this.site.lastUseragent, 'foo');
	});

});

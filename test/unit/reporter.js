/* jshint maxlen: 200 */
/* global afterEach, beforeEach, describe, it */
'use strict';

var assert = require('proclaim');
var mockery = require('mockery');

describe('reporter', function () {
	var reporter = require('../../lib/reporter');

	beforeEach(function () {
		mockery.enable({
			warnOnUnregistered: false,
			warnOnReplace: false
		});
		mockery.registerMock('pa11y-reporter-foo', {});
	});

	afterEach(function () {
		mockery.disable();
	});

	describe('#load()', function () {

		it('should load built-in reporters', function () {
			reporter.load('json', function (err, reporter) {
				assert.isNull(err);
				assert.isObject(reporter);
			});
		});

		it('should load reporters in `pa11y-reporter-<name>` node modules', function () {
			reporter.load('foo', function (err, reporter) {
				assert.isNull(err);
				assert.isObject(reporter);
			});
		});

		it('should error when no reporter is found', function () {
			reporter.load('please-dont-register-this-module-name', function (err, reporter) {
				assert.isObject(err);
				assert.isNull(reporter);
			});
		});

	});

});

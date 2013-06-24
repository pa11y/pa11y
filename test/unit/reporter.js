/* jshint maxlen: 200 */
/* global afterEach, beforeEach, describe, it */
'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var sinon = require('sinon');

describe('reporter', function () {
	var reporter = require('../../lib/reporter');

	describe('.sanitize()', function () {

		it('should default all reporter functions', function () {
			var rep = reporter.sanitize({});
			assert.isFunction(rep.begin);
			assert.isFunction(rep.log);
			assert.isFunction(rep.debug);
			assert.isFunction(rep.error);
			assert.isFunction(rep.handleResult);
			assert.isFunction(rep.end);
		});

	});

	describe('.load()', function () {
		var fooReporter;

		beforeEach(function () {
			mockery.enable({
				warnOnUnregistered: false,
				warnOnReplace: false
			});
			fooReporter = {};
			mockery.registerMock('pa11y-reporter-foo', fooReporter);
			sinon.spy(reporter, 'sanitize');
		});

		afterEach(function () {
			mockery.disable();
			reporter.sanitize.restore();
		});

		it('should load built-in reporters', function () {
			reporter.load('json', function (err, rep) {
				assert.isNull(err);
				assert.isObject(rep);
			});
		});

		it('should load reporters in `pa11y-reporter-<name>` node modules', function () {
			reporter.load('foo', function (err, rep) {
				assert.isNull(err);
				assert.isObject(rep);
			});
		});

		it('should error when no reporter is found', function () {
			reporter.load('please-dont-register-this-module-name', function (err, rep) {
				assert.isObject(err);
				assert.isNull(rep);
			});
		});

		it('should sanitize the loaded reporter', function () {
			reporter.load('foo', function () {
				assert.isTrue(reporter.sanitize.withArgs(fooReporter).calledOnce);
			});
		});

	});

});

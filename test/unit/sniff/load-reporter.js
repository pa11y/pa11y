/* jshint maxlen: 200, maxstatements: 20 */
/* global afterEach, beforeEach, describe, it */
'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var sinon = require('sinon');

describe('sniff/load-reporter', function () {
	var loadReporter = require('../../../lib/sniff/load-reporter');
	var fooReporter;

	beforeEach(function () {
		mockery.enable({
			warnOnUnregistered: false,
			warnOnReplace: false
		});
		fooReporter = {};
		mockery.registerMock('pa11y-reporter-foo', fooReporter);
	});

	afterEach(function () {
		mockery.disable();
	});

	it('should be a function', function () {
		assert.isFunction(loadReporter);
	});

	it('should have a sanitize function', function () {
		assert.isFunction(loadReporter.sanitize);
	});

	it('should load built-in reporters', function (done) {
		loadReporter('json', function (err, rep) {
			assert.isNull(err);
			assert.isObject(rep);
			done();
		});
	});

	it('should load reporters in `pa11y-reporter-<name>` node modules', function (done) {
		loadReporter('foo', function (err, rep) {
			assert.isNull(err);
			assert.isObject(rep);
			done();
		});
	});

	it('should error when no reporter is found', function (done) {
		loadReporter('please-dont-register-this-module-name', function (err, rep) {
			assert.isObject(err);
			assert.isNull(rep);
			done();
		});
	});

	it('should sanitize the loaded reporter', function (done) {
		sinon.spy(loadReporter, 'sanitize');
		loadReporter('foo', function () {
			assert.isTrue(loadReporter.sanitize.withArgs(fooReporter).calledOnce);
			loadReporter.sanitize.restore();
			done();
		});
	});

	describe('.sanitize()', function () {

		it('should default all reporter functions', function () {
			var rep = loadReporter.sanitize({});
			assert.isFunction(rep.begin);
			assert.isFunction(rep.log);
			assert.isFunction(rep.debug);
			assert.isFunction(rep.error);
			assert.isFunction(rep.handleResult);
			assert.isFunction(rep.end);
		});

	});

});

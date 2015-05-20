/* jshint maxstatements: false, maxlen: false */
/* global beforeEach, describe, it */
'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var sinon = require('sinon');

describe('lib/pa11y', function () {
	var extend, pa11y, phantom, pkg, truffler, trufflerPkg;

	beforeEach(function () {

		extend = sinon.spy(require('node.extend'));
		mockery.registerMock('node.extend', extend);

		phantom = require('../mock/phantom');
		mockery.registerMock('phantom', phantom);

		pkg = require('../../../package.json');
		trufflerPkg = require('truffler/package.json');

		truffler = require('../mock/truffler');
		mockery.registerMock('truffler', truffler);

		pa11y = require('../../../lib/pa11y');

	});

	it('should be a function', function () {
		assert.isFunction(pa11y);
	});

	it('should have a `defaults` property', function () {
		assert.isObject(pa11y.defaults);
	});

	describe('.defaults', function () {
		var defaults;

		beforeEach(function () {
			defaults = pa11y.defaults;
		});

		it('should have a `log` property', function () {
			assert.isObject(defaults.log);
		});

		it('should have a `log.debug` method', function () {
			assert.isFunction(defaults.log.debug);
		});

		it('should have a `log.error` method', function () {
			assert.isFunction(defaults.log.error);
		});

		it('should have a `log.info` method', function () {
			assert.isFunction(defaults.log.info);
		});

		it('should have a `page` property', function () {
			assert.isObject(defaults.page);
		});

		it('should have a `page.settings` property', function () {
			assert.isObject(defaults.page.settings);
		});

		it('should have a `page.settings.userAgent` property', function () {
			assert.strictEqual(defaults.page.settings.userAgent, 'pa11y/' + pkg.version + ' (truffler/' + trufflerPkg.version + ')');
		});

		it('should have a `standard` property', function () {
			assert.strictEqual(defaults.standard, 'WCAG2AA');
		});

		it('should have a `timeout` property', function () {
			assert.strictEqual(defaults.timeout, 30000);
		});

	});

	it('should default the options', function (done) {
		var options = {};
		pa11y(options, function () {
			assert.calledOnce(extend);
			assert.isTrue(extend.firstCall.args[0]);
			assert.isObject(extend.firstCall.args[1]);
			assert.strictEqual(extend.firstCall.args[2], pa11y.defaults);
			assert.strictEqual(extend.firstCall.args[3], options);
			done();
		});
	});

	it('should initialise Truffler with the expected options', function (done) {
		pa11y({}, function () {
			assert.calledOnce(truffler);
			var options = truffler.firstCall.args[0];
			delete options.testFunction;
			assert.deepEqual(options, pa11y.defaults);
			assert.isFunction(truffler.firstCall.args[1]);
			done();
		});
	});

	it('should set a `testFunction` option in Truffler', function (done) {
		pa11y({}, function () {
			assert.isFunction(truffler.firstCall.args[0].testFunction);
			done();
		});
	});

	it('should not allow overriding of the `testFunction` option', function (done) {
		var testFunction = sinon.spy();
		pa11y({}, function () {
			assert.notStrictEqual(truffler.firstCall.args[0].testFunction, testFunction);
			done();
		});
	});

	it('should callback with Truffler\'s test and exit functions', function (done) {
		pa11y({}, function (error, test, exit) {
			assert.strictEqual(test, truffler.mockTestFunction);
			assert.strictEqual(exit, truffler.mockExitFunction);
			done();
		});
	});

	it('should callback with an error if Truffler fails', function (done) {
		var trufflerError = new Error('...');
		truffler.yieldsAsync(trufflerError, null, null);
		pa11y({}, function (error) {
			assert.strictEqual(error, trufflerError);
			done();
		});
	});

	describe('Truffler `testFunction` option', function () {
		var options, testFunction;

		beforeEach(function (done) {
			options = {};
			pa11y(options, function () {
				testFunction = truffler.firstCall.args[0].testFunction;
				done();
			});
		});

		it('should callback', function (done) {
			testFunction(phantom.mockBrowser, phantom.mockPage, done);
		});

		it('should do all the things pa11y is supposed to do');

	});

});

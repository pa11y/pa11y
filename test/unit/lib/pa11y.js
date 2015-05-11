/* jshint maxstatements: false, maxlen: false */
/* global beforeEach, describe, it */
'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var sinon = require('sinon');

describe('lib/pa11y', function () {
	var extend, pa11y, pkg;

	beforeEach(function () {

		extend = sinon.spy(require('node.extend'));
		mockery.registerMock('node.extend', extend);

		pkg = require('../../../package.json');

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

		it('should have a `page.cookies` property', function () {
			assert.isArray(defaults.page.cookies);
		});

		it('should have a `page.settings` property', function () {
			assert.isObject(defaults.page.settings);
		});

		it('should have a `page.viewport` property', function () {
			assert.isObject(defaults.page.viewport);
		});

		it('should have a `page.viewport.width` property', function () {
			assert.strictEqual(defaults.page.viewport.width, 1024);
		});

		it('should have a `page.viewport.width` property', function () {
			assert.strictEqual(defaults.page.viewport.height, 768);
		});

		it('should have a `phantom` property', function () {
			assert.isObject(defaults.phantom);
		});

		it('should have a `phantom.port` property', function () {
			assert.strictEqual(defaults.phantom.port, 12300);
		});

		it('should have a `standard` property', function () {
			assert.strictEqual(defaults.standard, 'WCAG2AA');
		});

		it('should have a `timeout` property', function () {
			assert.strictEqual(defaults.timeout, 30000);
		});

		it('should have a `useragent` property', function () {
			assert.strictEqual(defaults.useragent, 'pa11y/' + pkg.version);
		});

	});

	it('should return a function', function () {
		assert.isFunction(pa11y());
	});

	it('should default the options', function () {
		var options = {};
		pa11y(options);
		assert.calledOnce(extend);
		assert.isTrue(extend.firstCall.args[0]);
		assert.isObject(extend.firstCall.args[1]);
		assert.strictEqual(extend.firstCall.args[2], pa11y.defaults);
		assert.strictEqual(extend.firstCall.args[3], options);
	});

});

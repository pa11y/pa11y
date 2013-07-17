/* jshint maxlen: 200, maxstatements: 20 */
/* global afterEach, beforeEach, describe, it */
'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var path = require('path');
var sinon = require('sinon');

describe('sniff/load-config', function () {
	var loadConfig = require('../../../lib/sniff/load-config');
	var exampleConfig;

	beforeEach(function () {
		mockery.enable({
			warnOnUnregistered: false,
			warnOnReplace: false
		});
		exampleConfig = {foo: 'bar', ignore: []};
		mockery.registerMock(path.resolve(process.cwd(), './config/pa11y.json'), exampleConfig);
		mockery.registerMock(path.resolve(process.cwd(), './pa11y'), exampleConfig);
	});

	afterEach(function () {
		mockery.disable();
	});

	it('should be a function', function () {
		assert.isFunction(loadConfig);
	});

	it('should have a sanitize function', function () {
		assert.isFunction(loadConfig.sanitize);
	});

	it('should load json files', function (done) {
		loadConfig('./config/pa11y.json', function (err, config) {
			assert.deepEqual(config, exampleConfig);
			done();
		});
	});

	it('should load javascript files', function (done) {
		loadConfig('./pa11y', function (err, config) {
			assert.deepEqual(config, exampleConfig);
			done();
		});
	});

	it('should error when the config file does not could not be loaded', function () {
		loadConfig('./not-a-config-file', function (err) {
			assert.isInstanceOf(err, Error);
			assert.match(err.message, /not found/i);
		});
	});

	it('should sanitize the loaded config', function (done) {
		sinon.spy(loadConfig, 'sanitize');
		loadConfig('./config/pa11y.json', function () {
			assert.isTrue(loadConfig.sanitize.withArgs(exampleConfig).calledOnce);
			loadConfig.sanitize.restore();
			done();
		});
	});

	describe('.sanitize()', function () {

		it('should not modify the original config object', function () {
			var config = {};
			assert.notStrictEqual(loadConfig.sanitize(config), config);
		});

		it('should make sure an ignore array is present', function () {
			assert.deepEqual(loadConfig.sanitize({}).ignore, []);
			assert.deepEqual(loadConfig.sanitize({ignore: 'foo'}).ignore, []);
		});

		it('should not modify the ignore array if present', function () {
			assert.deepEqual(loadConfig.sanitize({ignore: [1, 2, 3]}).ignore, [1, 2, 3]);
		});

	});

});

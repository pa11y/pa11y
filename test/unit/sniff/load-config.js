// This file is part of pa11y.
// 
// pa11y is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// pa11y is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with pa11y.  If not, see <http://www.gnu.org/licenses/>.

/* jshint maxlen: 200, maxstatements: 20 */
/* global afterEach, beforeEach, describe, it */
'use strict';

var assert = require('proclaim');
var fs = require('fs');
var path = require('path');
var sinon = require('sinon');

describe('sniff/load-config', function () {
	var loadConfig = require('../../../lib/sniff/load-config');
	var exampleConfig, exampleInvalidConfig, exampleConfigObject;

	beforeEach(function () {
		exampleConfig = '{"foo": "bar", "cookies": [], "ignore": []}';
		exampleInvalidConfig = '(function (lol) {} (lol));';
		exampleConfigObject = JSON.parse(exampleConfig);
		sinon.stub(fs, 'readFile');
		fs.readFile.withArgs(path.resolve(process.cwd(), './config/pa11y.json'), 'utf8').callsArgWith(2, null, exampleConfig);
		fs.readFile.withArgs(path.resolve(process.cwd(), './invalid-config-file'), 'utf8').callsArgWith(2, null, exampleInvalidConfig);
		fs.readFile.withArgs(path.resolve(process.cwd(), './not-a-config-file'), 'utf8').callsArgWith(2, new Error(), null);
		sinon.spy(JSON, 'parse');
	});

	afterEach(function () {
		fs.readFile.restore();
		JSON.parse.restore();
	});

	it('should be a function', function () {
		assert.isFunction(loadConfig);
	});

	it('should have a sanitize function', function () {
		assert.isFunction(loadConfig.sanitize);
	});

	it('should load json files', function (done) {
		loadConfig('./config/pa11y.json', function (err, config) {
			assert.isTrue(fs.readFile.withArgs(path.resolve(process.cwd(), './config/pa11y.json'), 'utf8').calledOnce);
			assert.isTrue(JSON.parse.withArgs(exampleConfig).calledOnce);
			assert.deepEqual(config, exampleConfigObject);
			done();
		});
	});

	it('should error when the config file is invalid JSON', function (done) {
		loadConfig('./invalid-config-file', function (err) {
			assert.isInstanceOf(err, Error);
			done();
		});
	});

	it('should provide the file path in a invalid config file', function (done) {
		loadConfig('./invalid-config-file', function (err) {
			assert.includes(err.message, 'invalid-config-file');
			assert.includes(err.file, 'invalid-config-file');
			done();
		});
	});

	it('should extend upon JSON.parse error message', function (done) {
		loadConfig('./invalid-config-file', function (err) {
			assert.includes(err.message, 'Unexpected token (');
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
			assert.isTrue(loadConfig.sanitize.withArgs(exampleConfigObject).calledOnce);
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

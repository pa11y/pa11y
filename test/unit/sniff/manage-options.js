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
/* global describe, it */
'use strict';

var assert = require('proclaim');
var OptionError = require('../../../lib/error/option-error');
var sinon = require('sinon');
var pkg = require('../../../package.json');

describe('sniff/manage-options', function () {
	var manageOptions = require('../../../lib/sniff/manage-options');

	it('should be a function', function () {
		assert.isFunction(manageOptions);
	});

	it('should have a defaultOptions property', function () {
		assert.isObject(manageOptions.defaultOptions);
	});

	it('should have an allowableStandards property', function () {
		assert.isObject(manageOptions.allowableStandards);
	});

	it('should callback with the expected object when no options are set', function (done) {
		manageOptions({}, function (err, opts) {
			assert.deepEqual(opts, manageOptions.defaultOptions);
			done();
		});
	});

	it('should callback with the expected object when all options are set', function (done) {
		var allOpts = {
			debug: true,
			htmlcs: 'http://foo',
			port: 12300,
			reporter: 'bar',
			standard: 'baz',
			strict: false,
			timeout: 123,
			viewport: {
				width: 10,
				height: 20,
			},
			useragent: 'qux'
		};
		manageOptions(allOpts, function (err, opts) {
			assert.deepEqual(opts, allOpts);
			done();
		});
	});

	it('should callback with the expected object when some options are set', function (done) {
		manageOptions({
			debug: true,
			reporter: 'foo',
			timeout: 123
		}, function (err, opts) {
			assert.deepEqual(opts, {
				debug: true,
				htmlcs: 'http://squizlabs.github.io/HTML_CodeSniffer/build/HTMLCS.js',
				port: 12300,
				reporter: 'foo',
				standard: 'WCAG2AA',
				strict: false,
				timeout: 123,
				viewport: {
					width: 640,
					height: 480,
				},
				useragent: 'pa11y/' + pkg.version
			});
			done();
		});
	});

	it('should sanitize the url option', function (done) {
		var url = require('../../../lib/url');
		sinon.stub(url, 'sanitize').withArgs('foo').returns('bar');
		manageOptions({
			url: 'foo'
		}, function (err, opts) {
			assert.isTrue(url.sanitize.withArgs('foo').calledOnce);
			assert.strictEqual(opts.url, 'bar');
			url.sanitize.restore();
			done();
		});
	});

	it('should sanitize the HTMLCS URL option', function (done) {
		var url = require('../../../lib/url');
		sinon.stub(url, 'sanitize').withArgs('bar').returns('baz');
		manageOptions({
			url: 'foo',
			htmlcs: 'bar'
		}, function (err, opts) {
			assert.isTrue(url.sanitize.withArgs('bar').calledOnce);
			assert.strictEqual(opts.htmlcs, 'baz');
			url.sanitize.restore();
			done();
		});
	});

	it('should convert the timeout option to an integer', function (done) {
		manageOptions({
			url: 'foo',
			timeout: '123'
		}, function (err, opts) {
			assert.strictEqual(opts.timeout, 123);
			done();
		});
	});

	it('should convert the port option to an integer', function (done) {
		manageOptions({
			url: 'foo',
			port: '123'
		}, function (err, opts) {
			assert.strictEqual(opts.port, 123);
			done();
		});
	});

	it('should not callback with an error when options are valid', function (done) {
		manageOptions({
			url: 'foo',
			timeout: '123',
			standard: 'Section508'
		}, function (err) {
			assert.isNull(err);
			done();
		});
	});

	it('should callback with an error when the url option is missing', function (done) {
		manageOptions({}, function (err) {
			assert.isInstanceOf(err, OptionError);
			assert.match(err.message, /url/i);
			done();
		});
	});

	it('should callback with an error when the timeout option is not a number', function (done) {
		manageOptions({
			url: 'foo',
			timeout: 'bar'
		}, function (err) {
			assert.isInstanceOf(err, OptionError);
			assert.match(err.message, /timeout/i);
			done();
		});
	});

	it('should callback with an error when the standard option is invalid', function (done) {
		manageOptions({
			url: 'foo',
			standard: 'bar'
		}, function (err) {
			assert.isInstanceOf(err, OptionError);
			assert.match(err.message, /standard/i);
			done();
		});
	});

});

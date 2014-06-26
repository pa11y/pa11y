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

/* jshint maxlen: 200, maxstatements: 50 */
/* global afterEach, beforeEach, describe, it */
'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var sinon = require('sinon');

describe('pa11y', function () {
	var pa11y = require('../../lib/pa11y');

	it('should be an object', function () {
		assert.isObject(pa11y);
	});

	it('should have a sniff function', function () {
		assert.isFunction(pa11y.sniff);
	});

	describe('.sniff()', function () {
		var opts, manageOptions, reporter, loadReporter, config, loadConfig,
			browser, page, loadUrl, messages, runHtmlCodeSniffer, results, handleResult;

		// Mock everything in the world ever.
		beforeEach(function () {

			mockery.enable({
				useCleanCache: true,
				warnOnUnregistered: false,
				warnOnReplace: false
			});

			opts = {
				url: 'foo',
				reporter: 'bar',
				config: 'baz',
				port: 1234,
				useragent: 'qux',
				viewport: {
					width: 1024,
					height: 960,
				},
			};
			manageOptions = sinon.stub().callsArgWith(1, null, opts);
			mockery.registerMock('./sniff/manage-options', manageOptions);

			reporter = {
				begin: sinon.spy(),
				log: sinon.spy(),
				debug: sinon.spy(),
				error: sinon.spy(),
				handleResult: sinon.spy(),
				end: sinon.spy()
			};
			loadReporter = sinon.stub().callsArgWith(1, null, reporter);
			loadReporter.sanitize = sinon.stub().returns(reporter);
			mockery.registerMock('./sniff/load-reporter', loadReporter);

			config = {
				cookies: [{
					'name': 'Valid-Cookie-Name',
					'value': 'Valid-Cookie-Value',
					'domain': 'localhost',
				}],
				ignore: ['bar']
			};
			loadConfig = sinon.stub().callsArgWith(1, null, config);
			loadConfig.sanitize = sinon.stub().returns(config);
			mockery.registerMock('./sniff/load-config', loadConfig);

			browser = {
				exit: sinon.spy()
			};
			page = {};
			loadUrl = sinon.stub().callsArgWith(2, null, browser, page);
			mockery.registerMock('./sniff/load-url', loadUrl);

			messages = [
				{code: 'foo'},
				{code: 'bar'}
			];
			runHtmlCodeSniffer = sinon.stub().callsArgWith(2, null, messages);
			mockery.registerMock('./sniff/run-html-codesniffer', runHtmlCodeSniffer);

			results = {};
			handleResult = sinon.stub().callsArgWith(1, null, results);
			mockery.registerMock('./sniff/handle-result', handleResult);

			pa11y = require('../../lib/pa11y');
		});

		afterEach(function () {
			mockery.disable();
		});

		it('should manage the given options', function (done) {
			pa11y.sniff(opts, function () {
				assert.isTrue(manageOptions.withArgs(opts).calledOnce);
				done();
			});
		});

		it('should load the expected reporter', function (done) {
			pa11y.sniff(opts, function () {
				assert.isTrue(loadReporter.withArgs(opts.reporter).calledOnce);
				done();
			});
		});

		it('should accept and sanitize a reporter object', function (done) {
			opts.reporter = reporter;
			pa11y.sniff(opts, function () {
				assert.isTrue(loadReporter.withArgs(opts.reporter).notCalled);
				assert.isTrue(loadReporter.sanitize.withArgs(opts.reporter).calledOnce);
				done();
			});
		});

		it('should not load a reporter if one is not specified', function (done) {
			delete opts.reporter;
			pa11y.sniff(opts, function () {
				assert.isTrue(loadReporter.withArgs(opts.reporter).notCalled);
				assert.isTrue(loadReporter.sanitize.withArgs({}).calledOnce);
				done();
			});
		});

		it('should load the expected config file', function (done) {
			pa11y.sniff(opts, function () {
				assert.isTrue(loadConfig.withArgs(opts.config).calledOnce);
				done();
			});
		});

		it('should accept and sanitize a config object', function (done) {
			opts.config = config;
			pa11y.sniff(opts, function () {
				assert.isTrue(loadConfig.withArgs(opts.config).notCalled);
				assert.isTrue(loadConfig.sanitize.withArgs(opts.config).calledOnce);
				done();
			});
		});

		it('should not load a config file if one is not specified', function (done) {
			delete opts.config;
			pa11y.sniff(opts, function () {
				assert.isTrue(loadConfig.withArgs(opts.config).notCalled);
				assert.isTrue(loadConfig.sanitize.withArgs({}).calledOnce);
				done();
			});
		});

		it('should load the expected page with the correct user agent, port, and cookies', function (done) {
			pa11y.sniff(opts, function () {
				var args = loadUrl.args[0];
				// url
				assert.equal('foo', args[0]);
				// options
				assert.deepEqual({
					userAgent: 'qux',
					port: 1234,
					viewport: {
						width: 1024,
						height: 960,
					},
					cookies: [
						{
							name: 'Valid-Cookie-Name',
							value: 'Valid-Cookie-Value',
							domain: 'localhost',
						},
					],
				}, args[1]);
				// callback
				assert.isFunction(args[2]);
				done();
			});
		});

		it('should run HTML CodeSniffer with the expected options', function (done) {
			pa11y.sniff(opts, function () {
				assert.isTrue(runHtmlCodeSniffer.withArgs(page, opts).calledOnce);
				done();
			});
		});

		it('should handle the HTML CodeSniffer results', function (done) {
			pa11y.sniff(opts, function () {
				assert.isTrue(handleResult.calledOnce);
				done();
			});
		});

		it('should filter the results based on the ignore configuration', function (done) {
			pa11y.sniff(opts, function () {
				assert.deepEqual(handleResult.getCall(0).args[0], [{code: 'foo'}]);
				done();
			});
		});

		it('should callback with the results', function (done) {
			pa11y.sniff(opts, function (err, res) {
				assert.strictEqual(res, results);
				done();
			});
		});

		it('should call all of the reporter methods except debug/error', function (done) {
			pa11y.sniff(opts, function () {
				assert.isTrue(reporter.begin.calledOnce, 'begin');
				assert.isTrue(reporter.log.called, 'log');
				assert.isTrue(reporter.handleResult.calledOnce, 'handleResult');
				assert.isTrue(reporter.end.calledOnce, 'end');
				done();
			});
		});

		it('should call the reporter debug method when the debug options is true', function (done) {
			opts.debug = true;
			pa11y.sniff(opts, function () {
				assert.isTrue(reporter.debug.called);
				done();
			});
		});

		it('should exit the browser once finished', function (done) {
			opts.debug = true;
			pa11y.sniff(opts, function () {
				assert.isTrue(browser.exit.calledOnce);
				done();
			});
		});

	});

});

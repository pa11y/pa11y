/* jshint maxlen: 200 */
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
		var opts, manageOptions, reporter, loadReporter, browser, page, loadUrl,
			messages, runHtmlCodeSniffer, results, handleResult;

		// Mock everything in the world ever.
		beforeEach(function () {

			mockery.enable({
				useCleanCache: true,
				warnOnUnregistered: false,
				warnOnReplace: false
			});

			opts = {
				url: 'foo',
				reporter: 'bar'
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
			mockery.registerMock('./sniff/load-reporter', loadReporter);

			browser = {
				exit: sinon.spy()
			};
			page = {};
			loadUrl = sinon.stub().callsArgWith(1, null, browser, page);
			mockery.registerMock('./sniff/load-url', loadUrl);

			messages = [];
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

		it('should load the expected page', function (done) {
			pa11y.sniff(opts, function () {
				assert.isTrue(loadUrl.withArgs(opts.url).calledOnce);
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
				assert.isTrue(handleResult.withArgs(messages).calledOnce);
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
				assert.isTrue(reporter.debug.called, 'log');
				done();
			});
		});

	});

});

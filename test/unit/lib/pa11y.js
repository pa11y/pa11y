
const assert = require('proclaim');
const mockery = require('mockery');
const path = require('path');
const sinon = require('sinon');

describe.only('lib/pa11y', () => {
	let extend;
	let pa11y;
	let pa11yResults;
	let pkg;
	let promiseTimeout;
	let puppeteer;

	beforeEach(() => {

		pa11yResults = {
			mockResults: true
		};
		/* eslint-disable no-underscore-dangle */
		global._runPa11y = sinon.stub().returns(pa11yResults);
		/* eslint-enable no-underscore-dangle */

		extend = sinon.spy(require('node.extend'));
		mockery.registerMock('node.extend', extend);

		pkg = require('../../../package.json');

		promiseTimeout = sinon.spy(require('p-timeout'));
		mockery.registerMock('p-timeout', promiseTimeout);

		puppeteer = require('../mock/puppeteer');
		mockery.registerMock('puppeteer', puppeteer);

		puppeteer.mockPage.evaluate.resolves(pa11yResults);

		pa11y = require('../../../lib/pa11y');

	});

	afterEach(() => {
		/* eslint-disable no-underscore-dangle */
		delete global._runPa11y;
		/* eslint-enable no-underscore-dangle */
	});

	it('is a function', () => {
		assert.isFunction(pa11y);
	});

	describe('pa11y(url)', () => {
		let resolvedValue;

		beforeEach(async () => {
			resolvedValue = await pa11y('mock-url');
		});

		it('defaults an empty options object with `pa11y.defaults`', () => {
			assert.calledOnce(extend);
			assert.isObject(extend.firstCall.args[0]);
			assert.strictEqual(extend.firstCall.args[1], pa11y.defaults);
			assert.deepEqual(extend.firstCall.args[2], {});
		});

		it('uses a promise timeout function', () => {
			assert.calledOnce(promiseTimeout);
			assert.instanceOf(promiseTimeout.firstCall.args[0], Promise);
			assert.strictEqual(promiseTimeout.firstCall.args[1], pa11y.defaults.timeout);
			assert.strictEqual(promiseTimeout.firstCall.args[2], `Pa11y timed out (${pa11y.defaults.timeout}ms)`);
		});

		it('launches puppeteer', () => {
			assert.calledOnce(puppeteer.launch);
			assert.calledWithExactly(puppeteer.launch);
		});

		it('creates a new page', () => {
			assert.calledOnce(puppeteer.mockBrowser.newPage);
			assert.calledWithExactly(puppeteer.mockBrowser.newPage);
		});

		it('creates a new page', () => {
			assert.calledOnce(puppeteer.mockBrowser.newPage);
			assert.calledWithExactly(puppeteer.mockBrowser.newPage);
		});

		it('sets the user-agent', () => {
			assert.calledOnce(puppeteer.mockPage.setUserAgent);
			assert.calledWith(puppeteer.mockPage.setUserAgent, pa11y.defaults.userAgent);
		});

		it('navigates to `url`', () => {
			assert.calledOnce(puppeteer.mockPage.goto);
			assert.calledWith(puppeteer.mockPage.goto, 'mock-url', {
				waitUntil: 'networkidle'
			});
		});

		it('sets the viewport', () => {
			assert.calledOnce(puppeteer.mockPage.setViewport);
			assert.calledWith(puppeteer.mockPage.setViewport, pa11y.defaults.viewport);
		});

		it('injects HTML CodeSniffer', () => {
			assert.called(puppeteer.mockPage.injectFile);
			assert.calledWith(puppeteer.mockPage.injectFile, path.resolve(`${__dirname}/../../../lib/vendor/HTMLCS.js`));
		});

		it('injects the Pa11y runner', () => {
			assert.called(puppeteer.mockPage.injectFile);
			assert.calledWith(puppeteer.mockPage.injectFile, path.resolve(`${__dirname}/../../../lib/runner.js`));
		});

		it('evaluates some JavaScript in the context of the page', () => {
			assert.calledOnce(puppeteer.mockPage.evaluate);
			assert.isFunction(puppeteer.mockPage.evaluate.firstCall.args[0]);
			assert.deepEqual(puppeteer.mockPage.evaluate.firstCall.args[1], {
				hideElements: pa11y.defaults.hideElements,
				ignore: pa11y.defaults.ignore,
				rootElement: pa11y.defaults.rootElement,
				rules: pa11y.defaults.rules,
				standard: pa11y.defaults.standard,
				wait: pa11y.defaults.wait
			});
		});

		describe('evaluated JavaScript', () => {
			let options;
			let returnValue;

			beforeEach(() => {
				options = {
					mockOptions: true
				};
				returnValue = puppeteer.mockPage.evaluate.firstCall.args[0](options);
			});

			it('calls `_runPa11y` with the passed in options', () => {
				/* eslint-disable no-underscore-dangle */
				assert.calledOnce(global._runPa11y);
				assert.calledWithExactly(global._runPa11y, options);
				/* eslint-enable no-underscore-dangle */
			});

			it('returns the return value of `_runPa11y`', () => {
				assert.strictEqual(returnValue, pa11yResults);
			});

		});

		it('closes the browser', () => {
			assert.calledOnce(puppeteer.mockBrowser.close);
			assert.calledWithExactly(puppeteer.mockBrowser.close);
		});

		it('resolves with the Pa11y results', () => {
			assert.strictEqual(resolvedValue, pa11yResults);
		});

		describe('when headless Chrome errors', () => {
			let headlessChromeError;
			let rejectedError;

			beforeEach(async () => {
				headlessChromeError = new Error('headless chrome error');
				puppeteer.mockBrowser.close.reset();
				puppeteer.mockPage.goto.rejects(headlessChromeError);
				try {
					await pa11y('mock-url');
				} catch (error) {
					rejectedError = error;
				}
			});

			it('closes the browser', () => {
				assert.calledOnce(puppeteer.mockBrowser.close);
				assert.calledWithExactly(puppeteer.mockBrowser.close);
			});

			it('rejects with the error', () => {
				assert.strictEqual(rejectedError, headlessChromeError);
			});

		});

	});

	describe('pa11y(options)', () => {
		let options;

		beforeEach(async () => {
			options = {
				url: 'mock-url',
				mockOptions: true
			};
			await pa11y(options);
		});

		it('defaults the options object with `pa11y.defaults`', () => {
			assert.calledOnce(extend);
			assert.isObject(extend.firstCall.args[0]);
			assert.strictEqual(extend.firstCall.args[1], pa11y.defaults);
			assert.deepEqual(extend.firstCall.args[2], options);
		});

		it('navigates to `options.url`', () => {
			assert.calledOnce(puppeteer.mockPage.goto);
			assert.calledWith(puppeteer.mockPage.goto, 'mock-url', {
				waitUntil: 'networkidle'
			});
		});

		describe('when `options.standard` is invalid', () => {
			let rejectedError;

			beforeEach(async () => {
				options.standard = 'not-a-standard';
				try {
					await pa11y(options);
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with a descriptive error', () => {
				assert.instanceOf(rejectedError, Error);
				assert.strictEqual(rejectedError.message, 'Standard must be one of Section508, WCAG2A, WCAG2AA, WCAG2AAA');
			});

		});

		describe('when `options.ignore` has items with uppercase letters', () => {

			beforeEach(async () => {
				extend.reset();
				options.ignore = [
					'WARNING'
				];
				await pa11y(options);
			});

			it('lowercases them', () => {
				assert.deepEqual(extend.firstCall.args[0].ignore, [
					'warning'
				]);
			});

		});

		describe('when `options.screenCapture` is set', () => {

			beforeEach(async () => {
				extend.reset();
				options.screenCapture = 'mock.png';
				await pa11y(options);
			});

			it('generates a screenshot', () => {
				assert.called(puppeteer.mockPage.screenshot);
				assert.calledWith(puppeteer.mockPage.screenshot, {
					path: options.screenCapture,
					fullPage: true
				});
			});

			describe('when screenshot generation fails', () => {
				let rejectedError;

				beforeEach(async () => {
					puppeteer.mockPage.screenshot.rejects(new Error('screenshot failed'));
					try {
						await pa11y(options);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('does not reject', () => {
					assert.isUndefined(rejectedError);
				});

			});

		});

		describe('when `options.headers` has properties', () => {

			beforeEach(async () => {
				options.headers = {
					foo: 'bar',
					bar: 'baz'
				};
				await pa11y(options);
			});

			it('sets the headers in the page', () => {
				assert.calledOnce(puppeteer.mockPage.setExtraHTTPHeaders);
				assert.instanceOf(puppeteer.mockPage.setExtraHTTPHeaders.firstCall.args[0], Map);
				assert.deepEqual(Array.from(puppeteer.mockPage.setExtraHTTPHeaders.firstCall.args[0]), [
					['foo', 'bar'],
					['bar', 'baz']
				]);
			});

		});

	});

	describe('pa11y(url, options)', () => {
		let options;

		beforeEach(async () => {
			options = {
				mockOptions: true
			};
			await pa11y('mock-url', options);
		});

		it('defaults the options object with `pa11y.defaults`', () => {
			assert.calledOnce(extend);
			assert.isObject(extend.firstCall.args[0]);
			assert.strictEqual(extend.firstCall.args[1], pa11y.defaults);
			assert.deepEqual(extend.firstCall.args[2], options);
		});

		it('navigates to `url`', () => {
			assert.calledOnce(puppeteer.mockPage.goto);
			assert.calledWith(puppeteer.mockPage.goto, 'mock-url', {
				waitUntil: 'networkidle'
			});
		});

	});

	it('has a `defaults` property', () => {
		assert.isObject(pa11y.defaults);
	});

	describe('.defaults', () => {

		// TODO Chrome path and config

		it('has an `actions` property', () => {
			assert.deepEqual(pa11y.defaults.actions, []);
		});

		it('has a `headers` property', () => {
			assert.deepEqual(pa11y.defaults.headers, {});
		});

		it('has a `hideElements` property', () => {
			assert.isNull(pa11y.defaults.hideElements);
		});

		it('has an `ignore` property', () => {
			assert.deepEqual(pa11y.defaults.ignore, []);
		});

		it('has a `log` property', () => {
			assert.isObject(pa11y.defaults.log);
		});

		it('has a `log.debug` method', () => {
			assert.isFunction(pa11y.defaults.log.debug);
		});

		it('has a `log.error` method', () => {
			assert.isFunction(pa11y.defaults.log.error);
		});

		it('has a `log.info` method', () => {
			assert.isFunction(pa11y.defaults.log.info);
		});

		it('has a `rootElement` property', () => {
			assert.isNull(pa11y.defaults.rootElement);
		});

		it('has a `rules` property', () => {
			assert.deepEqual(pa11y.defaults.rules, []);
		});

		it('has a `screenCapture` property', () => {
			assert.isNull(pa11y.defaults.screenCapture);
		});

		it('has a `standard` property', () => {
			assert.strictEqual(pa11y.defaults.standard, 'WCAG2AA');
		});

		it('has a `timeout` property', () => {
			assert.strictEqual(pa11y.defaults.timeout, 30000);
		});

		it('has a `userAgent` property', () => {
			assert.strictEqual(pa11y.defaults.userAgent, `pa11y/${pkg.version}`);
		});

		it('has a `viewport` property', () => {
			assert.deepEqual(pa11y.defaults.viewport, {
				width: 1280,
				height: 1024
			});
		});

		it('has a `wait` property', () => {
			assert.strictEqual(pa11y.defaults.wait, 0);
		});

	});

});

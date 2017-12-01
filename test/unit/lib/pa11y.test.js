'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const path = require('path');
const sinon = require('sinon');

describe('lib/pa11y', () => {
	let extend;
	let pa11y;
	let pa11yResults;
	let pkg;
	let promiseTimeout;
	let puppeteer;
	let runAction;
	let util;

	beforeEach(() => {

		pa11yResults = {
			mockResults: true
		};
		/* eslint-disable no-underscore-dangle */
		global._runPa11y = sinon.stub().returns(pa11yResults);
		/* eslint-enable no-underscore-dangle */

		runAction = require('../mock/action.mock');
		mockery.registerMock('./action', runAction);

		extend = sinon.spy(require('node.extend'));
		mockery.registerMock('node.extend', extend);

		pkg = require('../../../package.json');

		promiseTimeout = sinon.spy(require('p-timeout'));
		mockery.registerMock('p-timeout', promiseTimeout);

		puppeteer = require('../mock/puppeteer.mock');
		mockery.registerMock('puppeteer', puppeteer);

		puppeteer.mockPage.evaluate.resolves(pa11yResults);

		util = require('../mock/util.mock');
		mockery.registerMock('util', util);

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
			resolvedValue = await pa11y('https://mock-url/');
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

		it('launches puppeteer with `options.chromeLaunchConfig`', () => {
			assert.calledOnce(puppeteer.launch);
			assert.calledWithExactly(puppeteer.launch, pa11y.defaults.chromeLaunchConfig);
		});

		it('creates a new page', () => {
			assert.calledOnce(puppeteer.mockBrowser.newPage);
			assert.calledWithExactly(puppeteer.mockBrowser.newPage);
		});

		it('enables request interception', () => {
			assert.calledOnce(puppeteer.mockPage.setRequestInterceptionEnabled);
			assert.calledWithExactly(puppeteer.mockPage.setRequestInterceptionEnabled, true);
		});

		it('adds a request handler to the page', () => {
			assert.called(puppeteer.mockPage.on);
			assert.calledWith(puppeteer.mockPage.on, 'request');
			assert.isFunction(puppeteer.mockPage.on.withArgs('request').firstCall.args[1]);
		});

		describe('request handler', () => {
			let mockInterceptedRequest;

			beforeEach(() => {
				mockInterceptedRequest = {
					continue: sinon.stub()
				};
				puppeteer.mockPage.on.withArgs('request').firstCall.args[1](mockInterceptedRequest);
			});

			it('calls `interceptedRequest.continue` with the method option', () => {
				assert.calledOnce(mockInterceptedRequest.continue);
				assert.calledWith(mockInterceptedRequest.continue, {
					method: pa11y.defaults.method,
					headers: {
						'user-agent': pa11y.defaults.userAgent
					}
				});
			});

			describe('when called a second time', () => {

				beforeEach(() => {
					puppeteer.mockPage.on.withArgs('request').firstCall.args[1](mockInterceptedRequest);
				});

				it('calls `interceptedRequest.continue` with an empty object', () => {
					assert.calledTwice(mockInterceptedRequest.continue);
					assert.deepEqual(mockInterceptedRequest.continue.secondCall.args[0], {});
				});

			});

		});

		it('adds a console handler to the page', () => {
			assert.called(puppeteer.mockPage.on);
			assert.calledWith(puppeteer.mockPage.on, 'console');
			assert.isFunction(puppeteer.mockPage.on.withArgs('console').firstCall.args[1]);
		});

		describe('console handler', () => {

			beforeEach(() => {
				util.inspect.withArgs('mock-arg-1').returns('\'mock-arg-1\'');
				util.inspect.withArgs(true).returns('true');
				util.inspect.withArgs(['mock-arg-2']).returns('[ \'mock-arg-2\' ]');
				puppeteer.mockPage.on.withArgs('console').firstCall.args[1]('mock-arg-1', true, ['mock-arg-2']);
			});

			it('calls `util.inspect` with each console argument', () => {
				assert.calledThrice(util.inspect);
				assert.calledWith(util.inspect, 'mock-arg-1');
				assert.calledWith(util.inspect, true);
				assert.calledWith(util.inspect, ['mock-arg-2']);
			});

		});

		it('navigates to `url`', () => {
			assert.calledOnce(puppeteer.mockPage.goto);
			assert.calledWith(puppeteer.mockPage.goto, 'https://mock-url/', {
				waitUntil: 'networkidle',
				timeout: pa11y.defaults.timeout
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
				ignore: [
					'notice',
					'warning'
				],
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

		describe('when `url` does not have a scheme', () => {

			beforeEach(async () => {
				puppeteer.mockPage.goto.reset();
				resolvedValue = await pa11y('mock-url');
			});

			it('navigates to `url` with an `http` scheme added', () => {
				assert.calledOnce(puppeteer.mockPage.goto);
				assert.calledWith(puppeteer.mockPage.goto, 'http://mock-url');
			});

		});

		describe('when `url` does not have a scheme and starts with a slash', () => {

			beforeEach(async () => {
				puppeteer.mockPage.goto.reset();
				resolvedValue = await pa11y('/mock-path');
			});

			it('navigates to `url` with an `file` scheme added', () => {
				assert.calledOnce(puppeteer.mockPage.goto);
				assert.calledWith(puppeteer.mockPage.goto, 'file:///mock-path');
			});

		});

		describe('when `url` does not have a scheme and starts with a period', () => {

			beforeEach(async () => {
				puppeteer.mockPage.goto.reset();
				resolvedValue = await pa11y('./mock-path');
			});

			it('navigates to `url` with an `file` scheme added and a resolved path', () => {
				const resolvedPath = path.resolve(process.cwd(), './mock-path');
				assert.calledOnce(puppeteer.mockPage.goto);
				assert.calledWith(puppeteer.mockPage.goto, `file://${resolvedPath}`);
			});

		});

		describe('when Headless Chrome errors', () => {
			let headlessChromeError;
			let rejectedError;

			beforeEach(async () => {
				headlessChromeError = new Error('headless chrome error');
				puppeteer.mockBrowser.close.reset();
				puppeteer.mockPage.goto.rejects(headlessChromeError);
				try {
					await pa11y('https://mock-url/');
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
				mockOptions: true,
				timeout: 40000,
				url: 'https://mock-url/',
				log: {
					debug: sinon.stub(),
					error: sinon.stub(),
					info: sinon.stub()
				}
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
			assert.calledWith(puppeteer.mockPage.goto, 'https://mock-url/', {
				waitUntil: 'networkidle',
				timeout: options.timeout
			});
		});

		describe('console handler', () => {

			beforeEach(() => {
				util.inspect.withArgs('mock-arg-1').returns('\'mock-arg-1\'');
				util.inspect.withArgs(true).returns('true');
				util.inspect.withArgs(['mock-arg-2']).returns('[ \'mock-arg-2\' ]');
				puppeteer.mockPage.on.withArgs('console').firstCall.args[1]('mock-arg-1', true, ['mock-arg-2']);
			});

			it('calls `util.inspect` with each console argument', () => {
				assert.calledThrice(util.inspect);
				assert.calledWith(util.inspect, 'mock-arg-1');
				assert.calledWith(util.inspect, true);
				assert.calledWith(util.inspect, ['mock-arg-2']);
			});

			it('logs the console arguments with `options.log.debug`', () => {
				assert.calledWithExactly(options.log.debug, 'Browser Console: \'mock-arg-1\' true [ \'mock-arg-2\' ]');
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
					'MOCK-IGNORE'
				];
				await pa11y(options);
			});

			it('lowercases them', () => {
				assert.include(extend.firstCall.args[0].ignore, 'mock-ignore');
			});

		});

		describe('when `options.includeNotices` is `false`', () => {

			beforeEach(async () => {
				puppeteer.mockPage.evaluate.resetHistory();
				options.ignore = [];
				options.includeNotices = false;
				await pa11y(options);
			});

			it('automatically ignores notices', () => {
				assert.deepEqual(puppeteer.mockPage.evaluate.firstCall.args[1].ignore, [
					'notice',
					'warning'
				]);
			});

		});

		describe('when `options.includeNotices` is `true`', () => {

			beforeEach(async () => {
				puppeteer.mockPage.evaluate.resetHistory();
				options.ignore = [];
				options.includeNotices = true;
				await pa11y(options);
			});

			it('does not automatically ignore notices', () => {
				assert.deepEqual(puppeteer.mockPage.evaluate.firstCall.args[1].ignore, [
					'warning'
				]);
			});

		});

		describe('when `options.includeWarnings` is `false`', () => {

			beforeEach(async () => {
				puppeteer.mockPage.evaluate.resetHistory();
				options.ignore = [];
				options.includeWarnings = false;
				await pa11y(options);
			});

			it('automatically ignores warnings', () => {
				assert.deepEqual(puppeteer.mockPage.evaluate.firstCall.args[1].ignore, [
					'notice',
					'warning'
				]);
			});

		});

		describe('when `options.includeWarnings` is `true`', () => {

			beforeEach(async () => {
				puppeteer.mockPage.evaluate.resetHistory();
				options.ignore = [];
				options.includeWarnings = true;
				await pa11y(options);
			});

			it('does not automatically ignore warnings', () => {
				assert.deepEqual(puppeteer.mockPage.evaluate.firstCall.args[1].ignore, [
					'notice'
				]);
			});

		});

		describe('when `options.postData` is set', () => {

			beforeEach(async () => {
				puppeteer.mockPage.on.resetHistory();
				options.method = 'POST';
				options.postData = 'mock-post-data';
				await pa11y(options);
			});

			describe('request handler', () => {
				let mockInterceptedRequest;

				beforeEach(() => {
					mockInterceptedRequest = {
						continue: sinon.stub()
					};
					puppeteer.mockPage.on.withArgs('request').firstCall.args[1](mockInterceptedRequest);
				});

				it('calls `interceptedRequest.continue` with the postData option', () => {
					assert.calledOnce(mockInterceptedRequest.continue);
					assert.calledWith(mockInterceptedRequest.continue, {
						method: options.method,
						postData: options.postData,
						headers: {
							'user-agent': pa11y.defaults.userAgent
						}
					});
				});

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
				puppeteer.mockPage.on.resetHistory();
				options.headers = {
					foo: 'bar',
					bar: 'baz',
					'Foo-Bar-Baz': 'qux'
				};
				await pa11y(options);
			});

			describe('request handler', () => {
				let mockInterceptedRequest;

				beforeEach(() => {
					mockInterceptedRequest = {
						continue: sinon.stub()
					};
					puppeteer.mockPage.on.withArgs('request').firstCall.args[1](mockInterceptedRequest);
				});

				it('calls `interceptedRequest.continue` with the headers option all lower-cased', () => {
					assert.calledOnce(mockInterceptedRequest.continue);
					assert.calledWith(mockInterceptedRequest.continue, {
						method: pa11y.defaults.method,
						headers: {
							foo: 'bar',
							bar: 'baz',
							'foo-bar-baz': 'qux',
							'user-agent': pa11y.defaults.userAgent
						}
					});
				});

			});

		});

		describe('when `options.actions` is set', () => {

			beforeEach(async () => {
				extend.reset();
				options.actions = [
					'mock-action-1',
					'mock-action-2'
				];
				await pa11y(options);
			});

			it('calls runAction with each action', () => {
				assert.calledTwice(runAction);
				assert.calledWith(runAction, puppeteer.mockBrowser, puppeteer.mockPage, extend.firstCall.returnValue, 'mock-action-1');
				assert.calledWith(runAction, puppeteer.mockBrowser, puppeteer.mockPage, extend.firstCall.returnValue, 'mock-action-2');
			});

			describe('when an action rejects', () => {
				let actionError;
				let rejectedError;

				beforeEach(async () => {
					actionError = new Error('action error');
					runAction.rejects(actionError);
					try {
						await pa11y(options);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with the action error', () => {
					assert.strictEqual(rejectedError, actionError);
				});

			});

		});

	});

	describe('pa11y(url, options)', () => {
		let options;

		beforeEach(async () => {
			options = {
				mockOptions: true
			};
			await pa11y('https://mock-url/', options);
		});

		it('defaults the options object with `pa11y.defaults`', () => {
			assert.calledOnce(extend);
			assert.isObject(extend.firstCall.args[0]);
			assert.strictEqual(extend.firstCall.args[1], pa11y.defaults);
			assert.deepEqual(extend.firstCall.args[2], options);
		});

		it('navigates to `url`', () => {
			assert.calledOnce(puppeteer.mockPage.goto);
			assert.calledWith(puppeteer.mockPage.goto, 'https://mock-url/', {
				waitUntil: 'networkidle',
				timeout: pa11y.defaults.timeout
			});
		});

	});

	describe('pa11y(url, callback)', () => {
		let callbackError;
		let callbackResults;

		beforeEach(done => {
			pa11y('https://mock-url/', (error, results) => {
				callbackError = error;
				callbackResults = results;
				done();
			});
		});

		it('calls back with the Pa11y results', () => {
			assert.strictEqual(callbackResults, pa11yResults);
		});

		describe('when something errors', () => {
			let headlessChromeError;

			beforeEach(done => {
				headlessChromeError = new Error('headless chrome error');
				puppeteer.mockBrowser.close.reset();
				puppeteer.mockPage.goto.rejects(headlessChromeError);
				pa11y('https://mock-url/', (error, results) => {
					callbackError = error;
					callbackResults = results;
					done();
				});
			});

			it('closes the browser', () => {
				assert.calledOnce(puppeteer.mockBrowser.close);
				assert.calledWithExactly(puppeteer.mockBrowser.close);
			});

			it('calls back with the error', () => {
				assert.strictEqual(callbackError, headlessChromeError);
			});

		});

	});

	it('has an `isValidAction` method which aliases `action.isValidAction`', () => {
		assert.isFunction(pa11y.isValidAction);
		assert.strictEqual(pa11y.isValidAction, runAction.isValidAction);
	});

	it('has a `defaults` property', () => {
		assert.isObject(pa11y.defaults);
	});

	describe('.defaults', () => {

		it('has an `actions` property', () => {
			assert.deepEqual(pa11y.defaults.actions, []);
		});

		it('has a `chromeLaunchConfig` property', () => {
			assert.deepEqual(pa11y.defaults.chromeLaunchConfig, {
				ignoreHTTPSErrors: true
			});
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

		it('has an `includeNotices` property', () => {
			assert.isFalse(pa11y.defaults.includeNotices);
		});

		it('has an `includeWarnings` property', () => {
			assert.isFalse(pa11y.defaults.includeWarnings);
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

		it('has a `method` property', () => {
			assert.deepEqual(pa11y.defaults.method, 'GET');
		});

		it('has a `postData` property', () => {
			assert.isNull(pa11y.defaults.postData);
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

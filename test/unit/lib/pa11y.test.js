'use strict';

// Mock out require'd dependencies
jest.mock('fs', () => require('../mocks/fs.mock'));
jest.mock('../../../lib/action', () => require('../mocks/action.mock'));

const path = require('path');

// Mocked imports
const fs = require('fs');
const actions = require('../../../lib/action');

const getCallMatching = (value, obj) => obj.mock.calls.find(call => call[0] === value);

describe('lib/pa11y', () => {
	let htmlCodeSnifferPath;
	let pa11yResults;
	let pa11yRunnerPath;
	let pkg;
	let pa11y;
	let puppeteer;
	let extend;
	let semver;
	let promiseTimeout;

	beforeEach(() => {
		pa11yResults = {
			mockResults: true
		};
		/* eslint-disable no-underscore-dangle */
		global.window = {
			__pa11y: {
				run: jest.fn().mockReturnValue(pa11yResults)
			}
		};
		/* eslint-enable no-underscore-dangle */

		pkg = require('../../../package.json');

		htmlCodeSnifferPath = path.resolve(`${__dirname}/../../../node_modules/html_codesniffer/build/HTMLCS.js`);
		pa11yRunnerPath = path.resolve(`${__dirname}/../../../lib/runner.js`);
		fs.readFileSync.mockImplementation(filename => {
			switch (filename) {
				case htmlCodeSnifferPath: return 'mock-html-codesniffer-js';
				case pa11yRunnerPath: return 'mock-pa11y-runner-js';
				default: return undefined;
			}
		});

		// Do all the 3rd party mocks here so they get passed into pa11y correctly
		// hoisting to the top of the file causes problems with clearing mocks
		jest.isolateModules(() => {
			jest.doMock('puppeteer', () => require('../mocks/puppeteer.mock'));
			jest.doMock('node.extend', () => {
				const actual = jest.requireActual('node.extend');
				return jest.fn(actual);
			});
			jest.doMock('semver', () => require('../mocks/semver.mock'));
			jest.doMock('p-timeout', () => {
				const actual = jest.requireActual('p-timeout');
				return jest.fn(actual);
			});

			extend = require('node.extend');
			puppeteer = require('puppeteer');
			semver = require('semver');
			promiseTimeout = require('p-timeout');

			puppeteer.mockPage.evaluate.mockResolvedValue(pa11yResults);

			pa11y = require('../../../lib/pa11y');
		});

		semver.satisfies.mockReturnValue(true);
	});

	afterEach(() => {
		/* eslint-disable no-underscore-dangle */
		delete global.window;
		/* eslint-enable no-underscore-dangle */
	});

	it('is a function', () => {
		expect(pa11y).toEqual(expect.any(Function));
	});

	describe('pa11y(validUrl)', () => {
		let resolvedValue;

		beforeEach(async () => {
			resolvedValue = await pa11y('https://mock-url/');
		});

		it('defaults an empty options object with `pa11y.defaults`', () => {
			expect(extend).toHaveBeenCalledTimes(1);
			expect(typeof extend.mock.calls[0][0]).toBe('object');
			expect(extend.mock.calls[0][1]).toEqual(pa11y.defaults);
			expect(extend.mock.calls[0][2]).toEqual({});
		});

		it('uses a promise timeout function', () => {
			expect(promiseTimeout).toHaveBeenCalledTimes(1);
			expect(promiseTimeout.mock.calls[0][0]).toEqual(expect.any(Promise));
			expect(promiseTimeout.mock.calls[0][1]).toEqual(pa11y.defaults.timeout);
			expect(promiseTimeout.mock.calls[0][2]).toEqual(`Pa11y timed out (${pa11y.defaults.timeout}ms)`);
		});

		it('launches puppeteer with `options.chromeLaunchConfig`', () => {
			expect(puppeteer.launch).toHaveBeenCalledTimes(1);
			expect(puppeteer.launch).toHaveBeenCalledWith(pa11y.defaults.chromeLaunchConfig);
		});

		it('creates a new page', () => {
			expect(puppeteer.mockBrowser.newPage).toHaveBeenCalledTimes(1);
			expect(puppeteer.mockBrowser.newPage).toHaveBeenCalledWith();
		});

		it('set the user agent', () => {
			expect(puppeteer.mockPage.setUserAgent).toHaveBeenCalledTimes(1);
			expect(puppeteer.mockPage.setUserAgent).toHaveBeenCalledWith(pa11y.defaults.userAgent);
		});

		it('adds a console handler to the page', () => {
			expect(puppeteer.mockPage.on).toHaveBeenCalledWith('console', expect.any(Function));
		});

		it('navigates to `url`', () => {
			expect(puppeteer.mockPage.goto).toHaveBeenCalledTimes(1);
			expect(puppeteer.mockPage.goto).toHaveBeenCalledWith('https://mock-url/', {
				waitUntil: 'networkidle2',
				timeout: pa11y.defaults.timeout
			});
		});

		it('sets the viewport', () => {
			expect(puppeteer.mockPage.setViewport).toHaveBeenCalledTimes(1);
			expect(puppeteer.mockPage.setViewport).toHaveBeenCalledWith(pa11y.defaults.viewport);
		});

		it('loads the HTML CodeSniffer JavaScript', () => {
			expect(fs.readFileSync).toHaveBeenCalled();
			expect(fs.readFileSync).toHaveBeenCalledWith(htmlCodeSnifferPath, 'utf-8');
		});

		it('loads the Pa11y runner JavaScript', () => {
			expect(fs.readFileSync).toHaveBeenCalled();
			expect(fs.readFileSync).toHaveBeenCalledWith(path.resolve(`${__dirname}/../../../lib/runner.js`), 'utf-8');
		});

		it('evaluates the HTML CodeSniffer vendor and runner JavaScript', () => {
			expect(puppeteer.mockPage.evaluate).toHaveBeenCalled();
			expect(puppeteer.mockPage.evaluate.mock.calls[1][0]).toMatch(/^\s*;\s*mock-html-codesniffer-js\s*;/);
			expect(puppeteer.mockPage.evaluate.mock.calls[1][0]).toMatch(/;\s*window\.__pa11y\.runners\['htmlcs'\] = async \(?options\)?\s*=>.*/);
		});

		it('evaluates the the Pa11y runner JavaScript', () => {
			expect(puppeteer.mockPage.evaluate).toHaveBeenCalled();
			expect(puppeteer.mockPage.evaluate).toHaveBeenCalledWith('mock-pa11y-runner-js');
		});

		it('evaluates some JavaScript in the context of the page', () => {
			expect(puppeteer.mockPage.evaluate).toHaveBeenCalled();
			expect(puppeteer.mockPage.evaluate.mock.calls[2][0]).toEqual(expect.any(Function));
			expect(puppeteer.mockPage.evaluate.mock.calls[2][1]).toEqual({
				hideElements: pa11y.defaults.hideElements,
				ignore: [
					'notice',
					'warning'
				],
				pa11yVersion: pkg.version,
				rootElement: pa11y.defaults.rootElement,
				rules: pa11y.defaults.rules,
				runners: [
					'htmlcs'
				],
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
				returnValue = puppeteer.mockPage.evaluate.mock.calls[2][0](options);
			});

			it('calls `__pa11y.run` with the passed in options', () => {
				/* eslint-disable no-underscore-dangle */
				expect(global.window.__pa11y.run).toHaveBeenCalledTimes(1);
				expect(global.window.__pa11y.run).toHaveBeenCalledWith(options);
				/* eslint-enable no-underscore-dangle */
			});

			it('returns the return value of `__pa11y.run`', () => {
				expect(returnValue).toEqual(pa11yResults);
			});

		});

		it('closes the browser', () => {
			expect(puppeteer.mockBrowser.close).toHaveBeenCalledTimes(1);
			expect(puppeteer.mockBrowser.close).toHaveBeenCalledWith();
		});

		it('resolves with the Pa11y results', () => {
			expect(resolvedValue).toEqual(pa11yResults);
		});
	});

	describe('pa11y(invalidUrl)', () => {
		describe('when `url` does not have a scheme', () => {
			beforeEach(async () => {
				await pa11y('mock-url');
			});

			it('navigates to `url` with an `http` scheme added', () => {
				expect(puppeteer.mockPage.goto).toHaveBeenCalledTimes(1);
				expect(puppeteer.mockPage.goto).toHaveBeenCalledWith('http://mock-url', expect.anything());
			});

		});

		describe('when `url` does not have a scheme and is an absolute path', () => {
			const absolutePath = path.resolve(process.cwd(), './mock-path');

			beforeEach(async () => {
				await pa11y(absolutePath);
			});

			it('navigates to `url` with an `file` scheme added', () => {
				expect(puppeteer.mockPage.goto).toHaveBeenCalledTimes(1);
				expect(puppeteer.mockPage.goto).toHaveBeenCalledWith(`file://${absolutePath}`, expect.anything());
			});

		});

		describe('when `url` does not have a scheme and starts with a period', () => {

			beforeEach(async () => {
				await pa11y('./mock-path');
			});

			it('navigates to `url` with an `file` scheme added and a resolved path', () => {
				const resolvedPath = path.resolve(process.cwd(), './mock-path');
				expect(puppeteer.mockPage.goto).toHaveBeenCalledTimes(1);
				expect(puppeteer.mockPage.goto).toHaveBeenCalledWith(`file://${resolvedPath}`, expect.anything());
			});

		});
	});

	describe('when Headless Chrome errors', () => {
		let headlessChromeError;
		let rejectedError;

		beforeEach(async () => {
			headlessChromeError = new Error('headless chrome error');
			puppeteer.mockPage.goto.mockRejectedValueOnce(headlessChromeError);
			try {
				await pa11y('https://mock-url/');
			} catch (error) {
				rejectedError = error;
			}
		});

		it('closes the browser', () => {
			expect(puppeteer.mockBrowser.close).toHaveBeenCalledTimes(1);
			expect(puppeteer.mockBrowser.close).toHaveBeenCalledWith();
		});

		it('rejects with the error', () => {
			expect(rejectedError).toEqual(headlessChromeError);
		});

	});

	describe('pa11y(options)', () => {
		let options;

		beforeEach(() => {
			options = {
				mockOptions: true,
				timeout: 40000,
				url: 'https://mock-url/',
				log: {
					debug: jest.fn(),
					error: jest.fn(),
					info: jest.fn()
				}
			};
		});

		describe('with basic options', () => {
			beforeEach(async () => {
				await pa11y(options);
			});

			it('defaults the options object with `pa11y.defaults`', () => {
				expect(extend).toHaveBeenCalledTimes(1);
				expect(typeof extend.mock.calls[0][0]).toBe('object');
				expect(extend.mock.calls[0][1]).toEqual(pa11y.defaults);
				expect(extend.mock.calls[0][2]).toEqual(options);
			});

			it('navigates to `options.url`', () => {
				expect(puppeteer.mockPage.goto).toHaveBeenCalledTimes(1);
				expect(puppeteer.mockPage.goto).toHaveBeenCalledWith('https://mock-url/', {
					waitUntil: 'networkidle2',
					timeout: options.timeout
				});
			});

			describe('console handler', () => {
				let mockMessage;

				beforeEach(() => {
					mockMessage = {
						location: jest.fn().mockReturnValue({
							url: 'https://mock-url/',
							lineNumber: 1,
							columnNumber: 1
						}),
						text: jest.fn().mockReturnValue('mock-message'),
						type: jest.fn().mockReturnValue('log')
					};
					getCallMatching('console', puppeteer.mockPage.on)[1](mockMessage);
				});

				it('logs the console message text with `options.log.debug`', () => {
					expect(options.log.debug).toHaveBeenCalledWith('Browser Console: mock-message');
				});

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
				expect(rejectedError).toEqual(expect.any(Error));
				expect(rejectedError.message).toEqual('Standard must be one of WCAG2A, WCAG2AA, WCAG2AAA');
			});

		});

		describe('when `options.ignore` has items with uppercase letters', () => {

			beforeEach(async () => {
				options.ignore = [
					'MOCK-IGNORE'
				];
				await pa11y(options);
			});

			it('lowercases them', () => {
				expect(extend.mock.calls[0][0].ignore).toContain('mock-ignore');
			});

		});

		describe('when `options.includeNotices` is `false`', () => {

			beforeEach(async () => {
				options.ignore = [];
				options.includeNotices = false;
				await pa11y(options);
			});

			it('automatically ignores notices', () => {
				expect(puppeteer.mockPage.evaluate.mock.calls[2][1].ignore).toEqual([
					'notice',
					'warning'
				]);
			});

		});

		describe('when `options.includeNotices` is `true`', () => {

			beforeEach(async () => {
				options.ignore = [];
				options.includeNotices = true;
				await pa11y(options);
			});

			it('does not automatically ignore notices', () => {
				expect(puppeteer.mockPage.evaluate.mock.calls[2][1].ignore).toEqual([
					'warning'
				]);
			});

		});

		describe('when `options.includeWarnings` is `false`', () => {

			beforeEach(async () => {
				options.ignore = [];
				options.includeWarnings = false;
				await pa11y(options);
			});

			it('automatically ignores warnings', () => {
				expect(puppeteer.mockPage.evaluate.mock.calls[2][1].ignore).toEqual([
					'notice',
					'warning'
				]);
			});

		});

		describe('when `options.includeWarnings` is `true`', () => {

			beforeEach(async () => {
				options.ignore = [];
				options.includeWarnings = true;
				await pa11y(options);
			});

			it('does not automatically ignore warnings', () => {
				expect(puppeteer.mockPage.evaluate.mock.calls[2][1].ignore).toEqual([
					'notice'
				]);
			});

		});

		describe('when `options.postData` is set', () => {

			beforeEach(async () => {
				options.method = 'POST';
				options.postData = 'mock-post-data';
				await pa11y(options);
			});

			it('enables request interception', () => {
				expect(puppeteer.mockPage.setRequestInterception).toHaveBeenCalledTimes(1);
				expect(puppeteer.mockPage.setRequestInterception).toHaveBeenCalledWith(true);
			});

			it('adds a request handler to the page', () => {
				expect(puppeteer.mockPage.on).toHaveBeenCalled();
				expect(puppeteer.mockPage.on).toHaveBeenCalledWith('request', expect.any(Function));
			});

			describe('request handler', () => {
				let mockInterceptedRequest;

				beforeEach(() => {
					mockInterceptedRequest = {
						continue: jest.fn()
					};
					getCallMatching('request', puppeteer.mockPage.on)[1](mockInterceptedRequest);
				});

				it('calls `interceptedRequest.continue` with the postData option', () => {
					expect(mockInterceptedRequest.continue).toHaveBeenCalledTimes(1);
					expect(mockInterceptedRequest.continue).toHaveBeenCalledWith({
						method: options.method,
						postData: options.postData,
						headers: {}
					});
				});

				describe('when triggered again', () => {
					beforeEach(() => {
						const requestCall = puppeteer.mockPage.on.mock.calls.find(call => call[0] === 'request');
						requestCall[1](mockInterceptedRequest);
					});

					it('calls `interceptedRequest.continue` with an empty object', () => {
						expect(mockInterceptedRequest.continue).toHaveBeenCalledTimes(2);
						expect(mockInterceptedRequest.continue).toHaveBeenCalledWith({
							method: options.method,
							postData: options.postData,
							headers: {}
						});
						expect(mockInterceptedRequest.continue).toHaveBeenCalledWith({});
					});
				});
			});

		});

		describe('when `options.screenCapture` is set', () => {

			beforeEach(async () => {
				options.screenCapture = 'mock.png';
				await pa11y(options);
			});

			it('generates a screenshot', () => {
				expect(puppeteer.mockPage.screenshot).toHaveBeenCalled();
				expect(puppeteer.mockPage.screenshot).toHaveBeenCalledWith({
					path: options.screenCapture,
					fullPage: true
				});
			});

			describe('when screenshot generation fails', () => {
				let rejectedError;

				beforeEach(async () => {
					puppeteer.mockPage.screenshot.mockRejectedValue(new Error('screenshot failed'));
					try {
						await pa11y(options);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('does not reject', () => {
					expect(rejectedError).toBeUndefined();
				});

			});

		});

		describe('when `options.headers` has properties', () => {

			beforeEach(async () => {
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
						continue: jest.fn()
					};
					getCallMatching('request', puppeteer.mockPage.on)[1](mockInterceptedRequest);
				});

				it('calls `interceptedRequest.continue` with the headers option all lower-cased', () => {
					expect(mockInterceptedRequest.continue).toHaveBeenCalledTimes(1);
					expect(mockInterceptedRequest.continue).toHaveBeenCalledWith({
						method: pa11y.defaults.method,
						headers: {
							foo: 'bar',
							bar: 'baz',
							'foo-bar-baz': 'qux'
						}
					});
				});

			});

		});

		describe('when `options.userAgent` is `false`', () => {

			beforeEach(async () => {
				options.userAgent = false;
				await pa11y(options);
			});

			it('automatically ignores warnings', () => {
				expect(puppeteer.mockPage.setUserAgent).not.toHaveBeenCalled();
			});

		});

		describe('when `options.actions` is set', () => {

			beforeEach(async () => {
				options.actions = [
					'mock-action-1',
					'mock-action-2'
				];
				await pa11y(options);
			});

			it('calls runAction with each action', () => {
				expect(actions).toHaveBeenNthCalledWith(1, puppeteer.mockBrowser, puppeteer.mockPage, extend.mock.results[0].value, 'mock-action-1');
				expect(actions).toHaveBeenNthCalledWith(2, puppeteer.mockBrowser, puppeteer.mockPage, extend.mock.results[0].value, 'mock-action-2');
			});

			describe('when an action rejects', () => {
				let actionError;
				let rejectedError;

				beforeEach(async () => {
					actionError = new Error('action error');
					actions.mockRejectedValue(actionError);
					try {
						await pa11y(options);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with the action error', () => {
					expect(rejectedError).toEqual(actionError);
				});

			});

		});

		describe('when `options.browser` is set', () => {

			beforeEach(async () => {
				options.browser = {
					close: jest.fn(),
					newPage: jest.fn().mockResolvedValue(puppeteer.mockPage)
				};
				await pa11y(options);
			});

			it('does not launch puppeteer', () => {
				expect(puppeteer.launch).not.toHaveBeenCalled();
			});

			it('creates a new page using the passed in browser', () => {
				expect(options.browser.newPage).toHaveBeenCalledTimes(1);
				expect(options.browser.newPage).toHaveBeenCalledWith();
			});

			it('does not close the browser', () => {
				expect(options.browser.close).not.toHaveBeenCalled();
			});

			it('closes the page', () => {
				expect(puppeteer.mockPage.close).toHaveBeenCalledTimes(1);
			});

			describe('and an error occurs', () => {
				let headlessChromeError;

				beforeEach(async () => {
					headlessChromeError = new Error('headless chrome error');
					puppeteer.mockPage.goto.mockRejectedValue(headlessChromeError);
					try {
						await pa11y(options);
					} catch (error) {
					}
				});

				it('does not close the browser', () => {
					expect(options.browser.close).not.toHaveBeenCalled();
				});

			});

		});

		describe('when `options.browser` and `options.page` is set', () => {

			beforeEach(async () => {
				options.browser = puppeteer.mockBrowser;
				options.page = puppeteer.mockPage;

				await pa11y(options);
			});

			it('does not launch puppeteer', () => {
				expect(puppeteer.launch).not.toHaveBeenCalled();
			});

			it('does not open the page', () => {
				expect(options.browser.newPage).not.toHaveBeenCalled();
			});

			it('does not close the browser', () => {
				expect(options.browser.close).not.toHaveBeenCalled();
			});

			it('does not close the page', () => {
				expect(options.page.close).not.toHaveBeenCalled();
			});

			describe('and an error occurs', () => {
				let headlessChromeError;

				beforeEach(async () => {
					headlessChromeError = new Error('headless chrome error');
					puppeteer.mockPage.goto.mockRejectedValue(headlessChromeError);
					try {
						await pa11y(options);
					} catch (error) {
					}
				});

				it('does not close the browser', () => {
					expect(options.browser.close).not.toHaveBeenCalled();
				});

				it('does not close the page', () => {
					expect(options.page.close).not.toHaveBeenCalled();
				});

			});

		});

		describe('when `options.page` and `options.ignoreUrl` are set', () => {

			beforeEach(async () => {
				options.browser = puppeteer.mockBrowser;
				options.page = puppeteer.mockPage;
				options.ignoreUrl = true;

				await pa11y(options);
			});

			it('does not call page.goto', () => {
				expect(options.page.goto).not.toHaveBeenCalled();
			});
		});

		describe('when `options.page` is set without `options.browser`', () => {
			let rejectedError;

			beforeEach(async () => {
				options.page = puppeteer.mockPage;
				try {
					await pa11y(options);
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with a descriptive error', () => {
				expect(rejectedError).toEqual(expect.any(Error));
				expect(rejectedError.message).toEqual('The page option must only be set alongside the browser option');
			});

		});

		describe('when `options.ignoreUrl` is set without `options.page`', () => {
			let rejectedError;

			beforeEach(async () => {
				options.page = undefined;
				options.ignoreUrl = true;
				try {
					await pa11y(options);
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with a descriptive error', () => {
				expect(rejectedError).toEqual(expect.any(Error));
				expect(rejectedError.message).toEqual('The ignoreUrl option must only be set alongside the page option');
			});

		});

		describe('when `options.runners` is set', () => {
			beforeEach(async () => {
				jest.doMock('node-module-1', () => ({
					supports: 'mock-support-string',
					scripts: [
						'/mock-runner-node-module-1/vendor.js'
					],
					run: /* istanbul ignore next */ () => 'mock-runner-node-module-1'
				}), {virtual: true});

				jest.doMock('node-module-2', () => ({
					supports: 'mock-support-string',
					scripts: [
						'/mock-runner-node-module-2/vendor.js'
					],
					run: /* istanbul ignore next */ () => 'mock-runner-node-module-2'
				}), {virtual: true});

				fs.readFileSync.mockImplementation(filename => {
					switch (filename) {
						case '/mock-runner-node-module-1/vendor.js': return 'mock-runner-node-module-1-js';
						case '/mock-runner-node-module-2/vendor.js': return 'mock-runner-node-module-2-js';
						default: return undefined;
					}
				});

				options.runners = [
					'node-module-1',
					'node-module-2'
				];

				await pa11y(options);
			});

			it('loads all runner scripts', () => {
				expect(fs.readFileSync).toHaveBeenCalledTimes(3);
			});

			it('evaluates all vendor script and runner JavaScript', () => {
				expect(puppeteer.mockPage.evaluate).toHaveBeenCalled();

				expect(puppeteer.mockPage.evaluate.mock.calls[1][0]).toMatch(/^\s*;\s*mock-runner-node-module-1-js\s*;\s*;\s*window\.__pa11y\.runners\['node-module-1'\] = \(\)\s*=>\s*'mock-runner-node-module-1'\s*;\s*$/);
				expect(puppeteer.mockPage.evaluate.mock.calls[2][0]).toMatch(/^\s*;\s*mock-runner-node-module-2-js\s*;\s*;\s*window\.__pa11y\.runners\['node-module-2'\] = \(\)\s*=>\s*'mock-runner-node-module-2'\s*;\s*$/);
			});

			it('verifies that the runner supports the current version of Pa11y', () => {
				expect(semver.satisfies).toHaveBeenCalledTimes(2);
				expect(semver.satisfies).toHaveBeenCalledWith(pkg.version, 'mock-support-string');
			});
		});

		describe('when `options.runners` is set and one of the runners does not support the current version of Pa11y', () => {
			let rejectedError;

			beforeEach(async () => {
				jest.doMock('node-module', () => ({
					supports: 'mock-support-string',
					scripts: [
						'/mock-runner-node-module/vendor.js'
					],
					run: () => 'mock-runner-node-module'
				}), {virtual: true});

				semver.satisfies.mockReturnValue(false);

				options.runners = [
					'node-module'
				];

				try {
					await pa11y(options);
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with a descriptive error', () => {
				expect(rejectedError).toEqual(expect.any(Error));
				expect(rejectedError.message).toEqual([
					`The installed "node-module" runner does not support Pa11y ${pkg.version}`,
					'Please update your version of Pa11y or the runner',
					'Runner Support: mock-support-string',
					`Pa11y Version:    ${pkg.version}`
				].join('\n'));
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
			expect(extend).toHaveBeenCalledTimes(1);
			expect(typeof extend.mock.calls[0][0]).toBe('object');
			expect(extend.mock.calls[0][1]).toEqual(pa11y.defaults);
			expect(extend.mock.calls[0][2]).toEqual(options);
		});

		it('navigates to `url`', () => {
			expect(puppeteer.mockPage.goto).toHaveBeenCalledTimes(1);
			expect(puppeteer.mockPage.goto).toHaveBeenCalledWith('https://mock-url/', {
				waitUntil: 'networkidle2',
				timeout: pa11y.defaults.timeout
			});
		});

	});

	describe('pa11y(url, callback)', () => {

		describe('when no error', () => {
			let callbackResults;
			let callbackError;

			beforeEach(done => {
				pa11y('https://mock-url/', (error, results) => {
					callbackError = error;
					callbackResults = results;
					done();
				});
			});

			it('calls back with the Pa11y results', () => {
				expect(callbackResults).toEqual(pa11yResults);
				expect(callbackError).toBeUndefined();
			});
		});

		describe('when something errors', () => {
			let callbackError;
			let callbackResults;
			let headlessChromeError;

			beforeEach(done => {
				headlessChromeError = new Error('headless chrome error');
				puppeteer.mockPage.goto.mockRejectedValue(headlessChromeError);
				pa11y('https://mock-url/', (error, results) => {
					callbackError = error;
					callbackResults = results;
					done();
				});
			});

			it('closes the browser', () => {
				expect(puppeteer.mockBrowser.close).toHaveBeenCalledTimes(1);
				expect(puppeteer.mockBrowser.close).toHaveBeenCalledWith();
			});

			it('calls back with the error', () => {
				expect(callbackResults).toBeUndefined();
				expect(callbackError).toEqual(headlessChromeError);
			});

		});

	});

	it('has an `isValidAction` method which aliases `action.isValidAction`', () => {
		expect(pa11y.isValidAction).toEqual(expect.any(Function));
		expect(pa11y.isValidAction).toEqual(actions.isValidAction);
	});

	it('has a `defaults` property', () => {
		expect(typeof pa11y.defaults).toBe('object');
	});

	describe('.defaults', () => {

		it('has an `actions` property', () => {
			expect(pa11y.defaults.actions).toEqual([]);
		});

		it('has a `browser` property', () => {
			expect(pa11y.defaults.browser).toBeNull();
		});

		it('has a `chromeLaunchConfig` property', () => {
			expect(pa11y.defaults.chromeLaunchConfig).toEqual({
				ignoreHTTPSErrors: true
			});
		});

		it('has a `headers` property', () => {
			expect(pa11y.defaults.headers).toEqual({});
		});

		it('has a `hideElements` property', () => {
			expect(pa11y.defaults.hideElements).toBeNull();
		});

		it('has an `ignore` property', () => {
			expect(pa11y.defaults.ignore).toEqual([]);
		});

		it('has an `ignoreUrl` property', () => {
			expect(pa11y.defaults.ignoreUrl).toBe(false);
		});

		it('has an `includeNotices` property', () => {
			expect(pa11y.defaults.includeNotices).toBe(false);
		});

		it('has an `includeWarnings` property', () => {
			expect(pa11y.defaults.includeWarnings).toBe(false);
		});

		it('has a `log` property', () => {
			expect(typeof pa11y.defaults.log).toBe('object');
		});

		it('has a `log.debug` method', () => {
			expect(pa11y.defaults.log.debug).toEqual(expect.any(Function));
		});

		it('has a `log.error` method', () => {
			expect(pa11y.defaults.log.error).toEqual(expect.any(Function));
		});

		it('has a `log.info` method', () => {
			expect(pa11y.defaults.log.info).toEqual(expect.any(Function));
		});

		it('has a `method` property', () => {
			expect(pa11y.defaults.method).toEqual('GET');
		});

		it('has a `postData` property', () => {
			expect(pa11y.defaults.postData).toBeNull();
		});

		it('has a `rootElement` property', () => {
			expect(pa11y.defaults.rootElement).toBeNull();
		});

		it('has a `rules` property', () => {
			expect(pa11y.defaults.rules).toEqual([]);
		});

		it('has a `screenCapture` property', () => {
			expect(pa11y.defaults.screenCapture).toBeNull();
		});

		it('has a `standard` property', () => {
			expect(pa11y.defaults.standard).toEqual('WCAG2AA');
		});

		it('has a `timeout` property', () => {
			expect(pa11y.defaults.timeout).toEqual(60000);
		});

		it('has a `userAgent` property', () => {
			expect(pa11y.defaults.userAgent).toEqual(`pa11y/${pkg.version}`);
		});

		it('has a `viewport` property', () => {
			expect(pa11y.defaults.viewport).toEqual({
				width: 1280,
				height: 1024
			});
		});

		it('has a `wait` property', () => {
			expect(pa11y.defaults.wait).toEqual(0);
		});

	});

});

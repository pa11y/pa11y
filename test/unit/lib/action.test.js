'use strict';

const assert = require('proclaim');
const {createMockElement, createMockPrototypeElement} = require('../mock/element.mock');
const sinon = require('sinon');

describe('lib/action', function() {
	let mockEvent;
	let originalEvent;
	let puppeteer;
	let runAction;

	beforeEach(function() {
		mockEvent = {event: true};
		originalEvent = global.Event;
		global.Event = sinon.stub().returns(mockEvent);
		puppeteer = require('../mock/puppeteer.mock');
		runAction = require('../../../lib/action');
	});

	afterEach(function() {
		global.Event = originalEvent;
	});

	it('is a function', function() {
		assert.isFunction(runAction);
	});

	it('has an `actions` property', function() {
		assert.isArray(runAction.actions);
	});

	it('has an `isValidAction` method', function() {
		assert.isFunction(runAction.isValidAction);
	});

	describe('runAction(browser, page, options, actionString)', function() {
		let options;
		let resolvedValue;

		beforeEach(async function() {
			options = {
				log: {
					debug: sinon.spy()
				}
			};
			runAction.actions = [
				{
					match: /^foo/,
					run: sinon.stub().resolves()
				},
				{
					match: /^bar/,
					run: sinon.stub().resolves()
				}
			];
			resolvedValue = await runAction(puppeteer.mockBrowser, puppeteer.mockPage, options, 'bar 123');
		});

		it('calls the run function that matches the given `actionString`', function() {
			assert.notCalled(runAction.actions[0].run);
			assert.calledOnce(runAction.actions[1].run);
			assert.calledWith(runAction.actions[1].run, puppeteer.mockBrowser, puppeteer.mockPage, options);
			assert.deepEqual(runAction.actions[1].run.firstCall.args[3], [
				'bar'
			]);
		});

		it('resolves with nothing', function() {
			assert.isUndefined(resolvedValue);
		});

		describe('when `actionString` does not match an allowed action', function() {
			let rejectedError;

			beforeEach(async function() {
				runAction.actions[1].run.resetHistory();
				try {
					await runAction(puppeteer.mockBrowser, puppeteer.mockPage, options, 'baz 123');
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with an error', function() {
				assert.instanceOf(rejectedError, Error);
				assert.strictEqual(rejectedError.message, 'Failed action: "baz 123" cannot be resolved');
			});

		});

		describe('when the action runner rejects', function() {
			let actionRunnerError;
			let rejectedError;

			beforeEach(async function() {
				actionRunnerError = new Error('action-runner-error');
				runAction.actions[1].run.rejects(actionRunnerError);
				try {
					await runAction(puppeteer.mockBrowser, puppeteer.mockPage, options, 'bar 123');
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with the action runner error', function() {
				assert.strictEqual(rejectedError, actionRunnerError);
			});

		});

	});

	describe('.isValidAction(actionString)', function() {

		beforeEach(function() {
			runAction.actions = [
				{
					match: /foo/i
				}
			];
		});

		it('returns `true` when the actionString matches one of the allowed actions', function() {
			assert.isTrue(runAction.isValidAction('hello foo!'));
		});

		it('returns `false` when the actionString does not match any of the allowed actions', function() {
			assert.isFalse(runAction.isValidAction('hello bar!'));
		});

	});

	describe('navigate-url action', function() {
		let action;

		beforeEach(function() {
			action = runAction.actions.find(foundAction => {
				return foundAction.name === 'navigate-url';
			});
		});

		it('has a name property', function() {
			assert.strictEqual(action.name, 'navigate-url');
		});

		it('has a match property', function() {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', function() {
			it('matches all of the expected action strings', function() {
				assert.deepEqual('navigate to http://pa11y.org'.match(action.match), [
					'navigate to http://pa11y.org',
					undefined,
					'http://pa11y.org'
				]);
			});
		});

		it('has a `run` method', function() {
			assert.isFunction(action.run);
		});

		describe('.run(browser, page, options, matches)', function() {
			let matches;
			let resolvedValue;

			beforeEach(async function() {
				matches = 'navigate to http://pa11y.org'.match(action.match);
				resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
			});

			it('clicks the specified element on the page', function() {
				assert.calledOnce(puppeteer.mockPage.goto);
				assert.calledWithExactly(puppeteer.mockPage.goto, matches[2]);
			});

			it('resolves with `undefined`', function() {
				assert.isUndefined(resolvedValue);
			});

			describe('when the click fails', function() {
				let navigateError;
				let rejectedError;

				beforeEach(async function() {
					navigateError = new Error('navigate to error');
					puppeteer.mockPage.goto.rejects(navigateError);
					try {
						await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with a new error', function() {
					assert.notStrictEqual(rejectedError, navigateError);
					assert.instanceOf(rejectedError, Error);
					assert.strictEqual(rejectedError.message, 'Failed action: Could not navigate to "http://pa11y.org"');
				});
			});
		});
	});

	describe('click-element action', function() {
		let action;

		beforeEach(function() {
			action = runAction.actions.find(foundAction => {
				return foundAction.name === 'click-element';
			});
		});

		it('has a name property', function() {
			assert.strictEqual(action.name, 'click-element');
		});

		it('has a match property', function() {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', function() {

			it('matches all of the expected action strings', function() {
				assert.deepEqual('click .foo'.match(action.match), [
					'click .foo',
					undefined,
					'.foo'
				]);
				assert.deepEqual('click element .foo'.match(action.match), [
					'click element .foo',
					' element',
					'.foo'
				]);
				assert.deepEqual('click element .foo .bar .baz'.match(action.match), [
					'click element .foo .bar .baz',
					' element',
					'.foo .bar .baz'
				]);
			});

		});

		it('has a `run` method', function() {
			assert.isFunction(action.run);
		});

		describe('.run(browser, page, options, matches)', function() {
			let matches;
			let resolvedValue;

			beforeEach(async function() {
				matches = 'click element foo'.match(action.match);
				resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
			});

			it('clicks the specified element on the page', function() {
				assert.calledOnce(puppeteer.mockPage.click);
				assert.calledWithExactly(puppeteer.mockPage.click, matches[2]);
			});

			it('resolves with `undefined`', function() {
				assert.isUndefined(resolvedValue);
			});

			describe('when the click fails', function() {
				let clickError;
				let rejectedError;

				beforeEach(async function() {
					clickError = new Error('click error');
					puppeteer.mockPage.click.rejects(clickError);
					try {
						await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with a new error', function() {
					assert.notStrictEqual(rejectedError, clickError);
					assert.instanceOf(rejectedError, Error);
					assert.strictEqual(rejectedError.message, 'Failed action: no element matching selector "foo"');
				});

			});

		});

	});

	describe('set-field-value action', function() {
		let action;

		beforeEach(function() {
			action = runAction.actions.find(foundAction => {
				return foundAction.name === 'set-field-value';
			});
		});

		it('has a name property', function() {
			assert.strictEqual(action.name, 'set-field-value');
		});

		it('has a match property', function() {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', function() {

			it('matches all of the expected action strings', function() {
				assert.deepEqual('set .foo to bar'.match(action.match), [
					'set .foo to bar',
					undefined,
					'.foo',
					'bar'
				]);
				assert.deepEqual('set field .foo to bar'.match(action.match), [
					'set field .foo to bar',
					' field',
					'.foo',
					'bar'
				]);
				assert.deepEqual('set field .foo .bar .baz to hello world'.match(action.match), [
					'set field .foo .bar .baz to hello world',
					' field',
					'.foo .bar .baz',
					'hello world'
				]);
				assert.deepEqual('set field .foo to hello to the world'.match(action.match), [
					'set field .foo to hello to the world',
					' field',
					'.foo',
					'hello to the world'
				]);
			});

		});

		it('has a `run` method', function() {
			assert.isFunction(action.run);
		});

		describe('.run(browser, page, options, matches)', function() {
			let matches;
			let resolvedValue;

			beforeEach(async function() {
				matches = 'set field foo to bar'.match(action.match);
				resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
			});

			it('evaluates some JavaScript in the context of the page', function() {
				assert.calledOnce(puppeteer.mockPage.evaluate);
				assert.isFunction(puppeteer.mockPage.evaluate.firstCall.args[0]);
				assert.strictEqual(puppeteer.mockPage.evaluate.firstCall.args[1], matches[2]);
				assert.strictEqual(puppeteer.mockPage.evaluate.firstCall.args[2], matches[3]);
			});

			describe('evaluated JavaScript', function() {
				let mockElement;
				let originalDocument;

				beforeEach(async function() {
					mockElement = createMockElement();
					originalDocument = global.document;
					global.document = {
						querySelector: sinon.stub().returns(mockElement)
					};
					resolvedValue = await puppeteer.mockPage.evaluate.firstCall.args[0]('mock-selector', 'mock-value');
				});

				afterEach(function() {
					global.document = originalDocument;
				});

				it('calls `document.querySelector` with the passed in selector', function() {
					assert.calledOnce(global.document.querySelector);
					assert.calledWithExactly(global.document.querySelector, 'mock-selector');
				});

				it('sets the element `value` property to the passed in value', function() {
					assert.strictEqual(mockElement.value, 'mock-value');
				});

				it('triggers an input event on the element', function() {
					assert.calledOnce(Event);
					assert.calledWithExactly(Event, 'input', {
						bubbles: true
					});
					assert.calledOnce(mockElement.dispatchEvent);
					assert.calledWithExactly(mockElement.dispatchEvent, mockEvent);
				});

				it('resolves with `undefined`', function() {
					assert.isUndefined(resolvedValue);
				});

				describe('with an element created from a prototype', function() {
					beforeEach(async function() {
						const mockPrototypeElement = createMockPrototypeElement();
						global.document.querySelector.returns(mockPrototypeElement);
						resolvedValue = await puppeteer.mockPage.evaluate.firstCall.args[0]('mock-selector', 'mock-value');
					});

					afterEach(function() {
						global.document = originalDocument;
					});

					it('calls `document.querySelector` with the passed in selector', function() {
						assert.calledTwice(global.document.querySelector);
						assert.calledWithExactly(global.document.querySelector, 'mock-selector');
					});

					it('sets the element `value` property to the passed in value', function() {
						assert.strictEqual(mockElement.value, 'mock-value');
					});

					it('triggers an input event on the element', function() {
						assert.calledTwice(Event);
						assert.calledWithExactly(Event, 'input', {
							bubbles: true
						});
						assert.calledOnce(mockElement.dispatchEvent);
						assert.calledWithExactly(mockElement.dispatchEvent, mockEvent);
					});

					it('resolves with `undefined`', function() {
						assert.isUndefined(resolvedValue);
					});
				});

				describe('when an element with the given selector cannot be found', function() {
					let rejectedError;

					beforeEach(async function() {
						global.document.querySelector.returns(null);
						try {
							await puppeteer.mockPage.evaluate.firstCall.args[0]('mock-selector', 'mock-value');
						} catch (error) {
							rejectedError = error;
						}
					});

					it('rejects with an error', function() {
						assert.instanceOf(rejectedError, Error);
					});

				});

			});

			it('resolves with `undefined`', function() {
				assert.isUndefined(resolvedValue);
			});

			describe('when the evaluate fails', function() {
				let evaluateError;
				let rejectedError;

				beforeEach(async function() {
					evaluateError = new Error('evaluate error');
					puppeteer.mockPage.evaluate.rejects(evaluateError);
					try {
						await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with a new error', function() {
					assert.notStrictEqual(rejectedError, evaluateError);
					assert.instanceOf(rejectedError, Error);
					assert.strictEqual(rejectedError.message, 'Failed action: no element matching selector "foo"');
				});

			});

		});

	});

	describe('check-field action', function() {
		let action;

		beforeEach(function() {
			action = runAction.actions.find(foundAction => {
				return foundAction.name === 'check-field';
			});
		});

		it('has a name property', function() {
			assert.strictEqual(action.name, 'check-field');
		});

		it('has a match property', function() {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', function() {

			it('matches all of the expected action strings', function() {
				assert.deepEqual('check .foo'.match(action.match), [
					'check .foo',
					'check',
					undefined,
					'.foo'
				]);
				assert.deepEqual('check field .foo'.match(action.match), [
					'check field .foo',
					'check',
					' field',
					'.foo'
				]);
				assert.deepEqual('uncheck field .foo .bar .baz'.match(action.match), [
					'uncheck field .foo .bar .baz',
					'uncheck',
					' field',
					'.foo .bar .baz'
				]);
			});

		});

		it('has a `run` method', function() {
			assert.isFunction(action.run);
		});

		describe('.run(browser, page, options, matches)', function() {
			let matches;
			let resolvedValue;

			beforeEach(async function() {
				matches = 'check field foo'.match(action.match);
				resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
			});

			it('evaluates some JavaScript in the context of the page', function() {
				assert.calledOnce(puppeteer.mockPage.evaluate);
				assert.isFunction(puppeteer.mockPage.evaluate.firstCall.args[0]);
				assert.strictEqual(puppeteer.mockPage.evaluate.firstCall.args[1], matches[3]);
				assert.isTrue(puppeteer.mockPage.evaluate.firstCall.args[2]);
			});

			describe('evaluated JavaScript', function() {
				let mockElement;
				let originalDocument;

				beforeEach(async function() {
					mockElement = createMockElement();
					originalDocument = global.document;
					global.document = {
						querySelector: sinon.stub().returns(mockElement)
					};
					resolvedValue = await puppeteer.mockPage.evaluate.firstCall.args[0]('mock-selector', 'mock-checked');
				});

				afterEach(function() {
					global.document = originalDocument;
				});

				it('calls `document.querySelector` with the passed in selector', function() {
					assert.calledOnce(global.document.querySelector);
					assert.calledWithExactly(global.document.querySelector, 'mock-selector');
				});

				it('sets the element `checked` property to the passed in checked value', function() {
					assert.strictEqual(mockElement.checked, 'mock-checked');
				});

				it('triggers a change event on the element', function() {
					assert.calledOnce(Event);
					assert.calledWithExactly(Event, 'change', {
						bubbles: true
					});
					assert.calledOnce(mockElement.dispatchEvent);
					assert.calledWithExactly(mockElement.dispatchEvent, mockEvent);
				});

				it('resolves with `undefined`', function() {
					assert.isUndefined(resolvedValue);
				});

				describe('when an element with the given selector cannot be found', function() {
					let rejectedError;

					beforeEach(async function() {
						global.document.querySelector.returns(null);
						try {
							await puppeteer.mockPage.evaluate.firstCall.args[0]('mock-selector', 'mock-checked');
						} catch (error) {
							rejectedError = error;
						}
					});

					it('rejects with an error', function() {
						assert.instanceOf(rejectedError, Error);
					});

				});

			});

			it('resolves with `undefined`', function() {
				assert.isUndefined(resolvedValue);
			});

			describe('when `matches` indicates that the field should be unchecked', function() {

				beforeEach(async function() {
					puppeteer.mockPage.evaluate.resetHistory();
					matches = 'uncheck field foo'.match(action.match);
					resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes a `false` negation parameter into the evaluate', function() {
					assert.isFalse(puppeteer.mockPage.evaluate.firstCall.args[2]);
				});

			});

			describe('when the evaluate fails', function() {
				let evaluateError;
				let rejectedError;

				beforeEach(async function() {
					evaluateError = new Error('evaluate error');
					puppeteer.mockPage.evaluate.rejects(evaluateError);
					try {
						await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with a new error', function() {
					assert.notStrictEqual(rejectedError, evaluateError);
					assert.instanceOf(rejectedError, Error);
					assert.strictEqual(rejectedError.message, 'Failed action: no element matching selector "foo"');
				});

			});

		});

	});

	describe('screen-capture action', function() {
		let action;

		beforeEach(function() {
			action = runAction.actions.find(foundAction => {
				return foundAction.name === 'screen-capture';
			});
		});

		it('has a name property', function() {
			assert.strictEqual(action.name, 'screen-capture');
		});

		it('has a match property', function() {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', function() {

			it('matches all of the expected action strings', function() {
				assert.deepEqual('screen capture foo.png'.match(action.match), [
					'screen capture foo.png',
					'screen capture',
					undefined,
					'foo.png'
				]);
				assert.deepEqual('screen-capture foo.png'.match(action.match), [
					'screen-capture foo.png',
					'screen-capture',
					undefined,
					'foo.png'
				]);
				assert.deepEqual('capture screen to foo.png'.match(action.match), [
					'capture screen to foo.png',
					'capture screen',
					' to',
					'foo.png'
				]);
			});

		});

		it('has a `run` method', function() {
			assert.isFunction(action.run);
		});

		describe('.run(browser, page, options, matches)', function() {
			let matches;
			let resolvedValue;

			beforeEach(async function() {
				matches = 'screen capture foo.png'.match(action.match);
				resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
			});

			it('captures the full screen', function() {
				assert.calledOnce(puppeteer.mockPage.screenshot);
				assert.calledWith(puppeteer.mockPage.screenshot, {
					path: matches[3],
					fullPage: true
				});
			});

			it('resolves with `undefined`', function() {
				assert.isUndefined(resolvedValue);
			});

			describe('when the screen capture fails', function() {
				let screenCaptureError;
				let rejectedError;

				beforeEach(async function() {
					screenCaptureError = new Error('screen capture error');
					puppeteer.mockPage.screenshot.rejects(screenCaptureError);
					try {
						await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with the error', function() {
					assert.strictEqual(rejectedError, screenCaptureError);
				});

			});

		});

	});

	describe('wait-for-url action', function() {
		let action;

		beforeEach(function() {
			action = runAction.actions.find(foundAction => {
				return foundAction.name === 'wait-for-url';
			});
		});

		it('has a name property', function() {
			assert.strictEqual(action.name, 'wait-for-url');
		});

		it('has a match property', function() {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', function() {

			it('matches all of the expected action strings', function() {
				assert.deepEqual('wait for fragment #foo'.match(action.match), [
					'wait for fragment #foo',
					'fragment',
					undefined,
					undefined,
					'#foo'
				]);
				assert.deepEqual('wait for fragment to be #foo'.match(action.match), [
					'wait for fragment to be #foo',
					'fragment',
					' to be',
					undefined,
					'#foo'
				]);
				assert.deepEqual('wait for hash to be #foo'.match(action.match), [
					'wait for hash to be #foo',
					'hash',
					' to be',
					undefined,
					'#foo'
				]);
				assert.deepEqual('wait for path to be /foo'.match(action.match), [
					'wait for path to be /foo',
					'path',
					' to be',
					undefined,
					'/foo'
				]);
				assert.deepEqual('wait for host to be example.com'.match(action.match), [
					'wait for host to be example.com',
					'host',
					' to be',
					undefined,
					'example.com'
				]);
				assert.deepEqual('wait for url to be https://example.com/'.match(action.match), [
					'wait for url to be https://example.com/',
					'url',
					' to be',
					undefined,
					'https://example.com/'
				]);
				assert.deepEqual('wait for fragment to not be #bar'.match(action.match), [
					'wait for fragment to not be #bar',
					'fragment',
					' to not be',
					'not ',
					'#bar'
				]);
				assert.deepEqual('wait for hash to not be #bar'.match(action.match), [
					'wait for hash to not be #bar',
					'hash',
					' to not be',
					'not ',
					'#bar'
				]);
				assert.deepEqual('wait for path to not be /sso/login'.match(action.match), [
					'wait for path to not be /sso/login',
					'path',
					' to not be',
					'not ',
					'/sso/login'
				]);
				assert.deepEqual('wait for url to not be https://example.com/login'.match(action.match), [
					'wait for url to not be https://example.com/login',
					'url',
					' to not be',
					'not ',
					'https://example.com/login'
				]);
				assert.deepEqual('wait for host to not be example.com'.match(action.match), [
					'wait for host to not be example.com',
					'host',
					' to not be',
					'not ',
					'example.com'
				]);
				assert.notDeepEqual('wait for path not to be /account/signin/'.match(action.match), [
					'wait for path not to be /account/signin/',
					'path',
					undefined,
					undefined,
					'not to be /account/signin/'
				]);
			});

		});

		it('has a `run` method', function() {
			assert.isFunction(action.run);
		});

		describe('.run(browser, page, options, matches)', function() {
			let matches;
			let resolvedValue;

			beforeEach(async function() {
				matches = 'wait for path to be foo'.match(action.match);
				resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
			});

			it('waits for a function to evaluate to `true`', function() {
				assert.calledOnce(puppeteer.mockPage.waitForFunction);
				assert.isFunction(puppeteer.mockPage.waitForFunction.firstCall.args[0]);
				assert.deepEqual(puppeteer.mockPage.waitForFunction.firstCall.args[1], {});
				assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[2], 'pathname');
				assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[3], matches[4]);
				assert.isFalse(puppeteer.mockPage.waitForFunction.firstCall.args[4]);
			});

			describe('evaluated JavaScript', function() {
				let originalWindow;
				let returnValue;

				beforeEach(function() {
					originalWindow = global.window;
					global.window = {
						location: {
							'mock-property': 'value'
						}
					};
					returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-property', 'value', false);
				});

				afterEach(function() {
					global.window = originalWindow;
				});

				it('returns `true`', function() {
					assert.isTrue(returnValue);
				});

				describe('when the location property does not match the expected value', function() {

					beforeEach(function() {
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-property', 'incorrect-value', false);
					});

					it('returns `false`', function() {
						assert.isFalse(returnValue);
					});

				});

				describe('when the negated property is `true`', function() {

					beforeEach(function() {
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-property', 'value', true);
					});

					it('returns `false`', function() {
						assert.isFalse(returnValue);
					});

				});

				describe('when the negated property is `true` and the location property does not match the expected value', function() {

					beforeEach(function() {
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-property', 'incorrect-value', true);
					});

					it('returns `true`', function() {
						assert.isTrue(returnValue);
					});

				});

			});

			it('resolves with `undefined`', function() {
				assert.isUndefined(resolvedValue);
			});

			describe('when `matches` indicates that the subject is "fragment"', function() {

				beforeEach(async function() {
					puppeteer.mockPage.waitForFunction.resetHistory();
					matches = 'wait for fragment to be foo'.match(action.match);
					resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes the expected property name into the wait function', function() {
					assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[2], 'hash');
				});

			});

			describe('when `matches` indicates that the subject is "hash"', function() {

				beforeEach(async function() {
					puppeteer.mockPage.waitForFunction.resetHistory();
					matches = 'wait for hash to be foo'.match(action.match);
					resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes the expected property name into the wait function', function() {
					assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[2], 'hash');
				});

			});

			describe('when `matches` indicates that the subject is "host"', function() {

				beforeEach(async function() {
					puppeteer.mockPage.waitForFunction.resetHistory();
					matches = 'wait for host to be foo'.match(action.match);
					resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes the expected property name into the wait function', function() {
					assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[2], 'host');
				});

			});

			describe('when `matches` indicates that the subject is "url"', function() {

				beforeEach(async function() {
					puppeteer.mockPage.waitForFunction.resetHistory();
					matches = 'wait for url to be foo'.match(action.match);
					resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes the expected property name into the wait function', function() {
					assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[2], 'href');
				});

			});

			describe('when `matches` includes a negation like "to not be"', function() {

				beforeEach(async function() {
					puppeteer.mockPage.waitForFunction.resetHistory();
					matches = 'wait for path to not be foo'.match(action.match);
					resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes a `true` negation parameter into the wait function', function() {
					assert.isTrue(puppeteer.mockPage.waitForFunction.firstCall.args[4]);
				});

			});

		});

	});

	describe('wait-for-element-state action', function() {
		let action;

		beforeEach(function() {
			action = runAction.actions.find(foundAction => {
				return foundAction.name === 'wait-for-element-state';
			});
		});

		it('has a name property', function() {
			assert.strictEqual(action.name, 'wait-for-element-state');
		});

		it('has a match property', function() {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', function() {

			it('matches all of the expected action strings', function() {
				assert.deepEqual('wait for .foo to be added'.match(action.match), [
					'wait for .foo to be added',
					undefined,
					'.foo',
					' to be',
					'added'
				]);
				assert.deepEqual('wait for element .foo to be added'.match(action.match), [
					'wait for element .foo to be added',
					' element',
					'.foo',
					' to be',
					'added'
				]);
				assert.deepEqual('wait for element .foo .bar to be added'.match(action.match), [
					'wait for element .foo .bar to be added',
					' element',
					'.foo .bar',
					' to be',
					'added'
				]);
				assert.deepEqual('wait for .foo to be removed'.match(action.match), [
					'wait for .foo to be removed',
					undefined,
					'.foo',
					' to be',
					'removed'
				]);
				assert.deepEqual('wait for element .foo to be removed'.match(action.match), [
					'wait for element .foo to be removed',
					' element',
					'.foo',
					' to be',
					'removed'
				]);
				assert.deepEqual('wait for element .foo .bar to be removed'.match(action.match), [
					'wait for element .foo .bar to be removed',
					' element',
					'.foo .bar',
					' to be',
					'removed'
				]);
				assert.deepEqual('wait for .foo to be visible'.match(action.match), [
					'wait for .foo to be visible',
					undefined,
					'.foo',
					' to be',
					'visible'
				]);
				assert.deepEqual('wait for element .foo to be visible'.match(action.match), [
					'wait for element .foo to be visible',
					' element',
					'.foo',
					' to be',
					'visible'
				]);
				assert.deepEqual('wait for element .foo .bar to be visible'.match(action.match), [
					'wait for element .foo .bar to be visible',
					' element',
					'.foo .bar',
					' to be',
					'visible'
				]);
				assert.deepEqual('wait for .foo to be hidden'.match(action.match), [
					'wait for .foo to be hidden',
					undefined,
					'.foo',
					' to be',
					'hidden'
				]);
				assert.deepEqual('wait for element .foo to be hidden'.match(action.match), [
					'wait for element .foo to be hidden',
					' element',
					'.foo',
					' to be',
					'hidden'
				]);
				assert.deepEqual('wait for element .foo .bar to be hidden'.match(action.match), [
					'wait for element .foo .bar to be hidden',
					' element',
					'.foo .bar',
					' to be',
					'hidden'
				]);
			});

		});

		it('has a `run` method', function() {
			assert.isFunction(action.run);
		});

		describe('.run(browser, page, options, matches)', function() {
			let matches;
			let resolvedValue;

			beforeEach(async function() {
				matches = 'wait for element .foo to be added'.match(action.match);
				resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
			});

			it('waits for a function to evaluate to `true`', function() {
				assert.calledOnce(puppeteer.mockPage.waitForFunction);
				assert.isFunction(puppeteer.mockPage.waitForFunction.firstCall.args[0]);
				assert.deepEqual(puppeteer.mockPage.waitForFunction.firstCall.args[1], {
					polling: 200
				});
				assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[2], matches[2]);
				assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[3], matches[4]);
			});

			describe('evaluated JavaScript', function() {
				let mockElement;
				let originalDocument;
				let returnValue;

				beforeEach(function() {
					mockElement = createMockElement();
					originalDocument = global.document;
					global.document = {
						querySelector: sinon.stub().returns(null)
					};
					returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-selector', 'mock-state');
				});

				afterEach(function() {
					global.document = originalDocument;
				});

				it('calls `document.querySelector` with the passed in selector', function() {
					assert.calledOnce(global.document.querySelector);
					assert.calledWithExactly(global.document.querySelector, 'mock-selector');
				});

				it('returns `false`', function() {
					assert.isFalse(returnValue);
				});

				describe('when the selector returns an element and the state is "added"', function() {

					beforeEach(function() {
						global.document.querySelector.returns(mockElement);
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-selector', 'added');
					});

					it('returns `true`', function() {
						assert.isTrue(returnValue);
					});

				});

				describe('when the selector does not return an element and the state is "added"', function() {

					beforeEach(function() {
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-selector', 'added');
					});

					it('returns `false`', function() {
						assert.isFalse(returnValue);
					});

				});

				describe('when the selector does not return an element and the state is "removed"', function() {

					beforeEach(function() {
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-selector', 'removed');
					});

					it('returns `true`', function() {
						assert.isTrue(returnValue);
					});

				});

				describe('when the selector returns an element and the state is "removed"', function() {

					beforeEach(function() {
						global.document.querySelector.returns(mockElement);
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-selector', 'removed');
					});

					it('returns `false`', function() {
						assert.isFalse(returnValue);
					});

				});

				describe('when the selector returns a visible element and the state is "visible"', function() {

					beforeEach(function() {
						mockElement.offsetWidth = 100;
						global.document.querySelector.returns(mockElement);
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-selector', 'visible');
					});

					it('returns `true`', function() {
						assert.isTrue(returnValue);
					});

				});

				describe('when the selector returns a hidden element and the state is "visible"', function() {

					beforeEach(function() {
						global.document.querySelector.returns(mockElement);
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-selector', 'visible');
					});

					it('returns `false`', function() {
						assert.isFalse(returnValue);
					});

				});

				describe('when the selector returns a hidden element and the state is "hidden"', function() {

					beforeEach(function() {
						global.document.querySelector.returns(mockElement);
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-selector', 'hidden');
					});

					it('returns `true`', function() {
						assert.isTrue(returnValue);
					});

				});

				describe('when the selector returns a visible element and the state is "hidden"', function() {

					beforeEach(function() {
						mockElement.offsetWidth = 100;
						global.document.querySelector.returns(mockElement);
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-selector', 'hidden');
					});

					it('returns `false`', function() {
						assert.isFalse(returnValue);
					});

				});

			});

			it('resolves with `undefined`', function() {
				assert.isUndefined(resolvedValue);
			});

			describe('when `matches` indicates that the state is "removed"', function() {

				beforeEach(async function() {
					puppeteer.mockPage.waitForFunction.resetHistory();
					matches = 'wait for element .foo to be removed'.match(action.match);
					resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes the expected state into the wait function', function() {
					assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[3], 'removed');
				});

			});

			describe('when `matches` indicates that the state is "visible"', function() {

				beforeEach(async function() {
					puppeteer.mockPage.waitForFunction.resetHistory();
					matches = 'wait for element .foo to be visible'.match(action.match);
					resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes the expected state into the wait function', function() {
					assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[3], 'visible');
				});

			});

			describe('when `matches` indicates that the state is "hidden"', function() {

				beforeEach(async function() {
					puppeteer.mockPage.waitForFunction.resetHistory();
					matches = 'wait for element .foo to be hidden'.match(action.match);
					resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes the expected state into the wait function', function() {
					assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[3], 'hidden');
				});

			});

		});

	});

	describe('wait-for-element-event action', function() {
		let action;

		beforeEach(function() {
			action = runAction.actions.find(foundAction => {
				return foundAction.name === 'wait-for-element-event';
			});
		});

		it('has a name property', function() {
			assert.strictEqual(action.name, 'wait-for-element-event');
		});

		it('has a match property', function() {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', function() {

			it('matches all of the expected action strings', function() {
				assert.deepEqual('wait for element .foo to emit bar'.match(action.match), [
					'wait for element .foo to emit bar',
					' element',
					'.foo',
					'bar'
				]);
				assert.deepEqual('wait for element .foo .bar to emit baz-qux'.match(action.match), [
					'wait for element .foo .bar to emit baz-qux',
					' element',
					'.foo .bar',
					'baz-qux'
				]);
				assert.deepEqual('wait for .foo to emit bar'.match(action.match), [
					'wait for .foo to emit bar',
					undefined,
					'.foo',
					'bar'
				]);
			});

		});

		it('has a `run` method', function() {
			assert.isFunction(action.run);
		});

		describe('.run(browser, page, options, matches)', function() {
			let matches;
			let resolvedValue;

			beforeEach(async function() {
				matches = 'wait for element foo to emit bar'.match(action.match);
				resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
			});

			it('evaluates some JavaScript in the context of the page', function() {
				assert.calledOnce(puppeteer.mockPage.evaluate);
				assert.isFunction(puppeteer.mockPage.evaluate.firstCall.args[0]);
				assert.strictEqual(puppeteer.mockPage.evaluate.firstCall.args[1], matches[2]);
				assert.strictEqual(puppeteer.mockPage.evaluate.firstCall.args[2], matches[3]);
			});

			describe('evaluated JavaScript (evaluate)', function() {
				let mockElement;
				let originalDocument;

				beforeEach(async function() {
					mockElement = createMockElement();
					originalDocument = global.document;
					global.document = {
						querySelector: sinon.stub().returns(mockElement)
					};
					resolvedValue = await puppeteer.mockPage.evaluate.firstCall.args[0]('mock-selector', 'mock-event-type');
				});

				afterEach(function() {
					global.document = originalDocument;
				});

				it('calls `document.querySelector` with the passed in selector', function() {
					assert.calledOnce(global.document.querySelector);
					assert.calledWithExactly(global.document.querySelector, 'mock-selector');
				});

				it('adds a one-time event handler to the element for the passed in event type', function() {
					assert.calledOnce(mockElement.addEventListener);
					assert.strictEqual(mockElement.addEventListener.firstCall.args[0], 'mock-event-type');
					assert.isFunction(mockElement.addEventListener.firstCall.args[1]);
					assert.deepEqual(mockElement.addEventListener.firstCall.args[2], {
						once: true
					});
				});

				describe('event handler', function() {
					let originalWindow;

					beforeEach(function() {
						originalWindow = global.window;
						global.window = {};
						mockElement.addEventListener.firstCall.args[1]();
					});

					afterEach(function() {
						global.window = originalWindow;
					});

					it('sets `window._pa11yWaitForElementEventFired` to `true`', function() {
						/* eslint-disable no-underscore-dangle */
						assert.isTrue(window._pa11yWaitForElementEventFired);
						/* eslint-enable no-underscore-dangle */
					});

				});

				it('resolves with `undefined`', function() {
					assert.isUndefined(resolvedValue);
				});

				describe('when an element with the given selector cannot be found', function() {
					let rejectedError;

					beforeEach(async function() {
						global.document.querySelector.returns(null);
						try {
							await puppeteer.mockPage.evaluate.firstCall.args[0]('mock-selector', 'mock-event-type');
						} catch (error) {
							rejectedError = error;
						}
					});

					it('rejects with an error', function() {
						assert.instanceOf(rejectedError, Error);
					});

				});

			});

			it('waits for a function to evaluate to `true`', function() {
				assert.calledOnce(puppeteer.mockPage.waitForFunction);
				assert.isFunction(puppeteer.mockPage.waitForFunction.firstCall.args[0]);
				assert.deepEqual(puppeteer.mockPage.waitForFunction.firstCall.args[1], {
					polling: 200
				});
			});

			describe('evaluated JavaScript (wait for function)', function() {
				let originalWindow;
				let returnValue;

				beforeEach(function() {
					originalWindow = global.window;
					global.window = {};
					returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]();
				});

				afterEach(function() {
					global.window = originalWindow;
				});

				it('returns `false`', function() {
					assert.isFalse(returnValue);
				});

				describe('when `window._pa11yWaitForElementEventFired` is `true`', function() {

					beforeEach(function() {
						/* eslint-disable no-underscore-dangle */
						global.window._pa11yWaitForElementEventFired = true;
						/* eslint-enable no-underscore-dangle */
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]();
					});

					it('returns `true`', function() {
						assert.isTrue(returnValue);
					});

					it('deletes the `window._pa11yWaitForElementEventFired` variable', function() {
						/* eslint-disable no-underscore-dangle */
						assert.isUndefined(global.window._pa11yWaitForElementEventFired);
						/* eslint-enable no-underscore-dangle */
					});

				});

			});

			it('resolves with `undefined`', function() {
				assert.isUndefined(resolvedValue);
			});

			describe('when the evaluate fails', function() {
				let evaluateError;
				let rejectedError;

				beforeEach(async function() {
					evaluateError = new Error('evaluate error');
					puppeteer.mockPage.evaluate.rejects(evaluateError);
					try {
						await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with a new error', function() {
					assert.notStrictEqual(rejectedError, evaluateError);
					assert.instanceOf(rejectedError, Error);
					assert.strictEqual(rejectedError.message, 'Failed action: no element matching selector "foo"');
				});

			});

		});

	});

});

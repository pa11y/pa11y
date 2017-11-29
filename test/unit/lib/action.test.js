'use strict';

const assert = require('proclaim');
const createMockElement = require('../mock/element.mock');
const sinon = require('sinon');

describe('lib/action', () => {
	let mockEvent;
	let originalEvent;
	let puppeteer;
	let runAction;

	beforeEach(() => {
		mockEvent = {event: true};
		originalEvent = global.Event;
		global.Event = sinon.stub().returns(mockEvent);
		puppeteer = require('../mock/puppeteer.mock');
		runAction = require('../../../lib/action');
	});

	afterEach(() => {
		global.Event = originalEvent;
	});

	it('is a function', () => {
		assert.isFunction(runAction);
	});

	it('has an `actions` property', () => {
		assert.isArray(runAction.actions);
	});

	it('has an `isValidAction` method', () => {
		assert.isFunction(runAction.isValidAction);
	});

	describe('runAction(browser, page, options, actionString)', () => {
		let options;
		let resolvedValue;

		beforeEach(async () => {
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

		it('calls the run function that matches the given `actionString`', () => {
			assert.notCalled(runAction.actions[0].run);
			assert.calledOnce(runAction.actions[1].run);
			assert.calledWith(runAction.actions[1].run, puppeteer.mockBrowser, puppeteer.mockPage, options);
			assert.deepEqual(runAction.actions[1].run.firstCall.args[3], [
				'bar'
			]);
		});

		it('resolves with nothing', () => {
			assert.isUndefined(resolvedValue);
		});

		describe('when `actionString` does not match an allowed action', () => {
			let rejectedError;

			beforeEach(async () => {
				runAction.actions[1].run.reset();
				try {
					await runAction(puppeteer.mockBrowser, puppeteer.mockPage, options, 'baz 123');
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with an error', () => {
				assert.instanceOf(rejectedError, Error);
				assert.strictEqual(rejectedError.message, 'Failed action: "baz 123" cannot be resolved');
			});

		});

		describe('when the action runner rejects', () => {
			let actionRunnerError;
			let rejectedError;

			beforeEach(async () => {
				actionRunnerError = new Error('action-runner-error');
				runAction.actions[1].run.rejects(actionRunnerError);
				try {
					await runAction(puppeteer.mockBrowser, puppeteer.mockPage, options, 'bar 123');
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with the action runner error', () => {
				assert.strictEqual(rejectedError, actionRunnerError);
			});

		});

	});

	describe('.isValidAction(actionString)', () => {

		beforeEach(() => {
			runAction.actions = [
				{
					match: /foo/i
				}
			];
		});

		it('returns `true` when the actionString matches one of the allowed actions', () => {
			assert.isTrue(runAction.isValidAction('hello foo!'));
		});

		it('returns `false` when the actionString does not match any of the allowed actions', () => {
			assert.isFalse(runAction.isValidAction('hello bar!'));
		});

	});

	describe('click-element action', () => {
		let action;

		beforeEach(() => {
			action = runAction.actions.find(foundAction => {
				return foundAction.name === 'click-element';
			});
		});

		it('has a name property', () => {
			assert.strictEqual(action.name, 'click-element');
		});

		it('has a match property', () => {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', () => {

			it('matches all of the expected action strings', () => {
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

		it('has a `run` method', () => {
			assert.isFunction(action.run);
		});

		describe('.run(browser, page, options, matches)', () => {
			let matches;
			let resolvedValue;

			beforeEach(async () => {
				matches = 'click element foo'.match(action.match);
				resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
			});

			it('clicks the specified element on the page', () => {
				assert.calledOnce(puppeteer.mockPage.click);
				assert.calledWithExactly(puppeteer.mockPage.click, matches[2]);
			});

			it('resolves with `undefined`', () => {
				assert.isUndefined(resolvedValue);
			});

			describe('when the click fails', () => {
				let clickError;
				let rejectedError;

				beforeEach(async () => {
					clickError = new Error('click error');
					puppeteer.mockPage.click.rejects(clickError);
					try {
						await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with a new error', () => {
					assert.notStrictEqual(rejectedError, clickError);
					assert.instanceOf(rejectedError, Error);
					assert.strictEqual(rejectedError.message, 'Failed action: no element matching selector "foo"');
				});

			});

		});

	});

	describe('set-field-value action', () => {
		let action;

		beforeEach(() => {
			action = runAction.actions.find(foundAction => {
				return foundAction.name === 'set-field-value';
			});
		});

		it('has a name property', () => {
			assert.strictEqual(action.name, 'set-field-value');
		});

		it('has a match property', () => {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', () => {

			it('matches all of the expected action strings', () => {
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
			});

		});

		it('has a `run` method', () => {
			assert.isFunction(action.run);
		});

		describe('.run(browser, page, options, matches)', () => {
			let matches;
			let resolvedValue;

			beforeEach(async () => {
				matches = 'set field foo to bar'.match(action.match);
				resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
			});

			it('evaluates some JavaScript in the context of the page', () => {
				assert.calledOnce(puppeteer.mockPage.evaluate);
				assert.isFunction(puppeteer.mockPage.evaluate.firstCall.args[0]);
				assert.strictEqual(puppeteer.mockPage.evaluate.firstCall.args[1], matches[2]);
				assert.strictEqual(puppeteer.mockPage.evaluate.firstCall.args[2], matches[3]);
			});

			describe('evaluated JavaScript', () => {
				let mockElement;
				let originalDocument;

				beforeEach(async () => {
					mockElement = createMockElement();
					originalDocument = global.document;
					global.document = {
						querySelector: sinon.stub().returns(mockElement)
					};
					resolvedValue = await puppeteer.mockPage.evaluate.firstCall.args[0]('mock-selector', 'mock-value');
				});

				afterEach(() => {
					global.document = originalDocument;
				});

				it('calls `document.querySelector` with the passed in selector', () => {
					assert.calledOnce(global.document.querySelector);
					assert.calledWithExactly(global.document.querySelector, 'mock-selector');
				});

				it('sets the element `value` property to the passed in value', () => {
					assert.strictEqual(mockElement.value, 'mock-value');
				});

				it('triggers an input event on the element', () => {
					assert.calledOnce(Event);
					assert.calledWithExactly(Event, 'input', {
						bubbles: true
					});
					assert.calledOnce(mockElement.dispatchEvent);
					assert.calledWithExactly(mockElement.dispatchEvent, mockEvent);
				});

				it('resolves with `undefined`', () => {
					assert.isUndefined(resolvedValue);
				});

				describe('when an element with the given selector cannot be found', () => {
					let rejectedError;

					beforeEach(async () => {
						global.document.querySelector.returns(null);
						try {
							await puppeteer.mockPage.evaluate.firstCall.args[0]('mock-selector', 'mock-value');
						} catch (error) {
							rejectedError = error;
						}
					});

					it('rejects with an error', () => {
						assert.instanceOf(rejectedError, Error);
					});

				});

			});

			it('resolves with `undefined`', () => {
				assert.isUndefined(resolvedValue);
			});

			describe('when the evaluate fails', () => {
				let evaluateError;
				let rejectedError;

				beforeEach(async () => {
					evaluateError = new Error('evaluate error');
					puppeteer.mockPage.evaluate.rejects(evaluateError);
					try {
						await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with a new error', () => {
					assert.notStrictEqual(rejectedError, evaluateError);
					assert.instanceOf(rejectedError, Error);
					assert.strictEqual(rejectedError.message, 'Failed action: no element matching selector "foo"');
				});

			});

		});

	});

	describe('check-field action', () => {
		let action;

		beforeEach(() => {
			action = runAction.actions.find(foundAction => {
				return foundAction.name === 'check-field';
			});
		});

		it('has a name property', () => {
			assert.strictEqual(action.name, 'check-field');
		});

		it('has a match property', () => {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', () => {

			it('matches all of the expected action strings', () => {
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

		it('has a `run` method', () => {
			assert.isFunction(action.run);
		});

		describe('.run(browser, page, options, matches)', () => {
			let matches;
			let resolvedValue;

			beforeEach(async () => {
				matches = 'check field foo'.match(action.match);
				resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
			});

			it('evaluates some JavaScript in the context of the page', () => {
				assert.calledOnce(puppeteer.mockPage.evaluate);
				assert.isFunction(puppeteer.mockPage.evaluate.firstCall.args[0]);
				assert.strictEqual(puppeteer.mockPage.evaluate.firstCall.args[1], matches[3]);
				assert.isTrue(puppeteer.mockPage.evaluate.firstCall.args[2]);
			});

			describe('evaluated JavaScript', () => {
				let mockElement;
				let originalDocument;

				beforeEach(async () => {
					mockElement = createMockElement();
					originalDocument = global.document;
					global.document = {
						querySelector: sinon.stub().returns(mockElement)
					};
					resolvedValue = await puppeteer.mockPage.evaluate.firstCall.args[0]('mock-selector', 'mock-checked');
				});

				afterEach(() => {
					global.document = originalDocument;
				});

				it('calls `document.querySelector` with the passed in selector', () => {
					assert.calledOnce(global.document.querySelector);
					assert.calledWithExactly(global.document.querySelector, 'mock-selector');
				});

				it('sets the element `checked` property to the passed in checked value', () => {
					assert.strictEqual(mockElement.checked, 'mock-checked');
				});

				it('triggers a change event on the element', () => {
					assert.calledOnce(Event);
					assert.calledWithExactly(Event, 'change', {
						bubbles: true
					});
					assert.calledOnce(mockElement.dispatchEvent);
					assert.calledWithExactly(mockElement.dispatchEvent, mockEvent);
				});

				it('resolves with `undefined`', () => {
					assert.isUndefined(resolvedValue);
				});

				describe('when an element with the given selector cannot be found', () => {
					let rejectedError;

					beforeEach(async () => {
						global.document.querySelector.returns(null);
						try {
							await puppeteer.mockPage.evaluate.firstCall.args[0]('mock-selector', 'mock-checked');
						} catch (error) {
							rejectedError = error;
						}
					});

					it('rejects with an error', () => {
						assert.instanceOf(rejectedError, Error);
					});

				});

			});

			it('resolves with `undefined`', () => {
				assert.isUndefined(resolvedValue);
			});

			describe('when `matches` indicates that the field should be unchecked', () => {

				beforeEach(async () => {
					puppeteer.mockPage.evaluate.reset();
					matches = 'uncheck field foo'.match(action.match);
					resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes a `false` negation parameter into the evaluate', () => {
					assert.isFalse(puppeteer.mockPage.evaluate.firstCall.args[2]);
				});

			});

			describe('when the evaluate fails', () => {
				let evaluateError;
				let rejectedError;

				beforeEach(async () => {
					evaluateError = new Error('evaluate error');
					puppeteer.mockPage.evaluate.rejects(evaluateError);
					try {
						await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with a new error', () => {
					assert.notStrictEqual(rejectedError, evaluateError);
					assert.instanceOf(rejectedError, Error);
					assert.strictEqual(rejectedError.message, 'Failed action: no element matching selector "foo"');
				});

			});

		});

	});

	describe('screen-capture action', () => {
		let action;

		beforeEach(() => {
			action = runAction.actions.find(foundAction => {
				return foundAction.name === 'screen-capture';
			});
		});

		it('has a name property', () => {
			assert.strictEqual(action.name, 'screen-capture');
		});

		it('has a match property', () => {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', () => {

			it('matches all of the expected action strings', () => {
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

		it('has a `run` method', () => {
			assert.isFunction(action.run);
		});

		describe('.run(browser, page, options, matches)', () => {
			let matches;
			let resolvedValue;

			beforeEach(async () => {
				matches = 'screen capture foo.png'.match(action.match);
				resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
			});

			it('captures the full screen', () => {
				assert.calledOnce(puppeteer.mockPage.screenshot);
				assert.calledWith(puppeteer.mockPage.screenshot, {
					path: matches[3],
					fullPage: true
				});
			});

			it('resolves with `undefined`', () => {
				assert.isUndefined(resolvedValue);
			});

			describe('when the screen capture fails', () => {
				let screenCaptureError;
				let rejectedError;

				beforeEach(async () => {
					screenCaptureError = new Error('screen capture error');
					puppeteer.mockPage.screenshot.rejects(screenCaptureError);
					try {
						await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with the error', () => {
					assert.strictEqual(rejectedError, screenCaptureError);
				});

			});

		});

	});

	describe('wait-for-url action', () => {
		let action;

		beforeEach(() => {
			action = runAction.actions.find(foundAction => {
				return foundAction.name === 'wait-for-url';
			});
		});

		it('has a name property', () => {
			assert.strictEqual(action.name, 'wait-for-url');
		});

		it('has a match property', () => {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', () => {

			it('matches all of the expected action strings', () => {
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
			});

		});

		it('has a `run` method', () => {
			assert.isFunction(action.run);
		});

		describe('.run(browser, page, options, matches)', () => {
			let matches;
			let resolvedValue;

			beforeEach(async () => {
				matches = 'wait for path to be foo'.match(action.match);
				resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
			});

			it('waits for a function to evaluate to `true`', () => {
				assert.calledOnce(puppeteer.mockPage.waitForFunction);
				assert.isFunction(puppeteer.mockPage.waitForFunction.firstCall.args[0]);
				assert.deepEqual(puppeteer.mockPage.waitForFunction.firstCall.args[1], {});
				assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[2], 'pathname');
				assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[3], matches[4]);
				assert.isFalse(puppeteer.mockPage.waitForFunction.firstCall.args[4]);
			});

			describe('evaluated JavaScript', () => {
				let originalWindow;
				let returnValue;

				beforeEach(() => {
					originalWindow = global.window;
					global.window = {
						location: {
							'mock-property': 'value'
						}
					};
					returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-property', 'value', false);
				});

				afterEach(() => {
					global.window = originalWindow;
				});

				it('returns `true`', () => {
					assert.isTrue(returnValue);
				});

				describe('when the location property does not match the expected value', () => {

					beforeEach(() => {
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-property', 'incorrect-value', false);
					});

					it('returns `false`', () => {
						assert.isFalse(returnValue);
					});

				});

				describe('when the negated property is `true`', () => {

					beforeEach(() => {
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-property', 'value', true);
					});

					it('returns `false`', () => {
						assert.isFalse(returnValue);
					});

				});

				describe('when the negated property is `true` and the location property does not match the expected value', () => {

					beforeEach(() => {
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-property', 'incorrect-value', true);
					});

					it('returns `true`', () => {
						assert.isTrue(returnValue);
					});

				});

			});

			it('resolves with `undefined`', () => {
				assert.isUndefined(resolvedValue);
			});

			describe('when `matches` indicates that the subject is "fragment"', () => {

				beforeEach(async () => {
					puppeteer.mockPage.waitForFunction.reset();
					matches = 'wait for fragment to be foo'.match(action.match);
					resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes the expected property name into the wait function', () => {
					assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[2], 'hash');
				});

			});

			describe('when `matches` indicates that the subject is "hash"', () => {

				beforeEach(async () => {
					puppeteer.mockPage.waitForFunction.reset();
					matches = 'wait for hash to be foo'.match(action.match);
					resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes the expected property name into the wait function', () => {
					assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[2], 'hash');
				});

			});

			describe('when `matches` indicates that the subject is "host"', () => {

				beforeEach(async () => {
					puppeteer.mockPage.waitForFunction.reset();
					matches = 'wait for host to be foo'.match(action.match);
					resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes the expected property name into the wait function', () => {
					assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[2], 'host');
				});

			});

			describe('when `matches` indicates that the subject is "url"', () => {

				beforeEach(async () => {
					puppeteer.mockPage.waitForFunction.reset();
					matches = 'wait for url to be foo'.match(action.match);
					resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes the expected property name into the wait function', () => {
					assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[2], 'href');
				});

			});

			describe('when `matches` includes a negation like "to not be"', () => {

				beforeEach(async () => {
					puppeteer.mockPage.waitForFunction.reset();
					matches = 'wait for path to not be foo'.match(action.match);
					resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes a `true` negation parameter into the wait function', () => {
					assert.isTrue(puppeteer.mockPage.waitForFunction.firstCall.args[4]);
				});

			});

		});

	});

	describe('wait-for-element-state action', () => {
		let action;

		beforeEach(() => {
			action = runAction.actions.find(foundAction => {
				return foundAction.name === 'wait-for-element-state';
			});
		});

		it('has a name property', () => {
			assert.strictEqual(action.name, 'wait-for-element-state');
		});

		it('has a match property', () => {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', () => {

			it('matches all of the expected action strings', () => {
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

		it('has a `run` method', () => {
			assert.isFunction(action.run);
		});

		describe('.run(browser, page, options, matches)', () => {
			let matches;
			let resolvedValue;

			beforeEach(async () => {
				matches = 'wait for element .foo to be added'.match(action.match);
				resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
			});

			it('waits for a function to evaluate to `true`', () => {
				assert.calledOnce(puppeteer.mockPage.waitForFunction);
				assert.isFunction(puppeteer.mockPage.waitForFunction.firstCall.args[0]);
				assert.deepEqual(puppeteer.mockPage.waitForFunction.firstCall.args[1], {
					polling: 200
				});
				assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[2], matches[2]);
				assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[3], matches[4]);
			});

			describe('evaluated JavaScript', () => {
				let mockElement;
				let originalDocument;
				let returnValue;

				beforeEach(() => {
					mockElement = createMockElement();
					originalDocument = global.document;
					global.document = {
						querySelector: sinon.stub().returns(null)
					};
					returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-selector', 'mock-state');
				});

				afterEach(() => {
					global.document = originalDocument;
				});

				it('calls `document.querySelector` with the passed in selector', () => {
					assert.calledOnce(global.document.querySelector);
					assert.calledWithExactly(global.document.querySelector, 'mock-selector');
				});

				it('returns `false`', () => {
					assert.isFalse(returnValue);
				});

				describe('when the selector returns an element and the state is "added"', () => {

					beforeEach(() => {
						global.document.querySelector.returns(mockElement);
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-selector', 'added');
					});

					it('returns `true`', () => {
						assert.isTrue(returnValue);
					});

				});

				describe('when the selector does not return an element and the state is "added"', () => {

					beforeEach(() => {
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-selector', 'added');
					});

					it('returns `false`', () => {
						assert.isFalse(returnValue);
					});

				});

				describe('when the selector does not return an element and the state is "removed"', () => {

					beforeEach(() => {
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-selector', 'removed');
					});

					it('returns `true`', () => {
						assert.isTrue(returnValue);
					});

				});

				describe('when the selector returns an element and the state is "removed"', () => {

					beforeEach(() => {
						global.document.querySelector.returns(mockElement);
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-selector', 'removed');
					});

					it('returns `false`', () => {
						assert.isFalse(returnValue);
					});

				});

				describe('when the selector returns a visible element and the state is "visible"', () => {

					beforeEach(() => {
						mockElement.offsetWidth = 100;
						global.document.querySelector.returns(mockElement);
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-selector', 'visible');
					});

					it('returns `true`', () => {
						assert.isTrue(returnValue);
					});

				});

				describe('when the selector returns a hidden element and the state is "visible"', () => {

					beforeEach(() => {
						global.document.querySelector.returns(mockElement);
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-selector', 'visible');
					});

					it('returns `false`', () => {
						assert.isFalse(returnValue);
					});

				});

				describe('when the selector returns a hidden element and the state is "hidden"', () => {

					beforeEach(() => {
						global.document.querySelector.returns(mockElement);
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-selector', 'hidden');
					});

					it('returns `true`', () => {
						assert.isTrue(returnValue);
					});

				});

				describe('when the selector returns a visible element and the state is "hidden"', () => {

					beforeEach(() => {
						mockElement.offsetWidth = 100;
						global.document.querySelector.returns(mockElement);
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]('mock-selector', 'hidden');
					});

					it('returns `false`', () => {
						assert.isFalse(returnValue);
					});

				});

			});

			it('resolves with `undefined`', () => {
				assert.isUndefined(resolvedValue);
			});

			describe('when `matches` indicates that the state is "removed"', () => {

				beforeEach(async () => {
					puppeteer.mockPage.waitForFunction.reset();
					matches = 'wait for element .foo to be removed'.match(action.match);
					resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes the expected state into the wait function', () => {
					assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[3], 'removed');
				});

			});

			describe('when `matches` indicates that the state is "visible"', () => {

				beforeEach(async () => {
					puppeteer.mockPage.waitForFunction.reset();
					matches = 'wait for element .foo to be visible'.match(action.match);
					resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes the expected state into the wait function', () => {
					assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[3], 'visible');
				});

			});

			describe('when `matches` indicates that the state is "hidden"', () => {

				beforeEach(async () => {
					puppeteer.mockPage.waitForFunction.reset();
					matches = 'wait for element .foo to be hidden'.match(action.match);
					resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes the expected state into the wait function', () => {
					assert.strictEqual(puppeteer.mockPage.waitForFunction.firstCall.args[3], 'hidden');
				});

			});

		});

	});

	describe('wait-for-element-event action', () => {
		let action;

		beforeEach(() => {
			action = runAction.actions.find(foundAction => {
				return foundAction.name === 'wait-for-element-event';
			});
		});

		it('has a name property', () => {
			assert.strictEqual(action.name, 'wait-for-element-event');
		});

		it('has a match property', () => {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', () => {

			it('matches all of the expected action strings', () => {
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

		it('has a `run` method', () => {
			assert.isFunction(action.run);
		});

		describe('.run(browser, page, options, matches)', () => {
			let matches;
			let resolvedValue;

			beforeEach(async () => {
				matches = 'wait for element foo to emit bar'.match(action.match);
				resolvedValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
			});

			it('evaluates some JavaScript in the context of the page', () => {
				assert.calledOnce(puppeteer.mockPage.evaluate);
				assert.isFunction(puppeteer.mockPage.evaluate.firstCall.args[0]);
				assert.strictEqual(puppeteer.mockPage.evaluate.firstCall.args[1], matches[2]);
				assert.strictEqual(puppeteer.mockPage.evaluate.firstCall.args[2], matches[3]);
			});

			describe('evaluated JavaScript (evaluate)', () => {
				let mockElement;
				let originalDocument;

				beforeEach(async () => {
					mockElement = createMockElement();
					originalDocument = global.document;
					global.document = {
						querySelector: sinon.stub().returns(mockElement)
					};
					resolvedValue = await puppeteer.mockPage.evaluate.firstCall.args[0]('mock-selector', 'mock-event-type');
				});

				afterEach(() => {
					global.document = originalDocument;
				});

				it('calls `document.querySelector` with the passed in selector', () => {
					assert.calledOnce(global.document.querySelector);
					assert.calledWithExactly(global.document.querySelector, 'mock-selector');
				});

				it('adds a one-time event handler to the element for the passed in event type', () => {
					assert.calledOnce(mockElement.addEventListener);
					assert.strictEqual(mockElement.addEventListener.firstCall.args[0], 'mock-event-type');
					assert.isFunction(mockElement.addEventListener.firstCall.args[1]);
					assert.deepEqual(mockElement.addEventListener.firstCall.args[2], {
						once: true
					});
				});

				describe('event handler', () => {
					let originalWindow;

					beforeEach(() => {
						originalWindow = global.window;
						global.window = {};
						mockElement.addEventListener.firstCall.args[1]();
					});

					afterEach(() => {
						global.window = originalWindow;
					});

					it('sets `window._pa11yWaitForElementEventFired` to `true`', () => {
						/* eslint-disable no-underscore-dangle */
						assert.isTrue(window._pa11yWaitForElementEventFired);
						/* eslint-enable no-underscore-dangle */
					});

				});

				it('resolves with `undefined`', () => {
					assert.isUndefined(resolvedValue);
				});

				describe('when an element with the given selector cannot be found', () => {
					let rejectedError;

					beforeEach(async () => {
						global.document.querySelector.returns(null);
						try {
							await puppeteer.mockPage.evaluate.firstCall.args[0]('mock-selector', 'mock-event-type');
						} catch (error) {
							rejectedError = error;
						}
					});

					it('rejects with an error', () => {
						assert.instanceOf(rejectedError, Error);
					});

				});

			});

			it('waits for a function to evaluate to `true`', () => {
				assert.calledOnce(puppeteer.mockPage.waitForFunction);
				assert.isFunction(puppeteer.mockPage.waitForFunction.firstCall.args[0]);
				assert.deepEqual(puppeteer.mockPage.waitForFunction.firstCall.args[1], {
					polling: 200
				});
			});

			describe('evaluated JavaScript (wait for function)', () => {
				let originalWindow;
				let returnValue;

				beforeEach(() => {
					originalWindow = global.window;
					global.window = {};
					returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]();
				});

				afterEach(() => {
					global.window = originalWindow;
				});

				it('returns `false`', () => {
					assert.isFalse(returnValue);
				});

				describe('when `window._pa11yWaitForElementEventFired` is `true`', () => {

					beforeEach(() => {
						/* eslint-disable no-underscore-dangle */
						global.window._pa11yWaitForElementEventFired = true;
						/* eslint-enable no-underscore-dangle */
						returnValue = puppeteer.mockPage.waitForFunction.firstCall.args[0]();
					});

					it('returns `true`', () => {
						assert.isTrue(returnValue);
					});

					it('deletes the `window._pa11yWaitForElementEventFired` variable', () => {
						/* eslint-disable no-underscore-dangle */
						assert.isUndefined(global.window._pa11yWaitForElementEventFired);
						/* eslint-enable no-underscore-dangle */
					});

				});

			});

			it('resolves with `undefined`', () => {
				assert.isUndefined(resolvedValue);
			});

			describe('when the evaluate fails', () => {
				let evaluateError;
				let rejectedError;

				beforeEach(async () => {
					evaluateError = new Error('evaluate error');
					puppeteer.mockPage.evaluate.rejects(evaluateError);
					try {
						await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with a new error', () => {
					assert.notStrictEqual(rejectedError, evaluateError);
					assert.instanceOf(rejectedError, Error);
					assert.strictEqual(rejectedError.message, 'Failed action: no element matching selector "foo"');
				});

			});

		});

	});

});

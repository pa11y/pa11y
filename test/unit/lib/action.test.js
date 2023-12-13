'use strict';

const {createMockElement, createMockPrototypeElement} = require('../mocks/element.mock');
const puppeteer = require('puppeteer');
const runAction = require('../../../lib/action');

jest.mock('puppeteer', () => require('../mocks/puppeteer.mock'));

describe('lib/action', () => {
	let mockEvent;
	let originalEvent;
	let mockElement;
	let originalDocument;

	beforeEach(() => {
		mockEvent = {event: true};
		originalEvent = global.Event;
		global.Event = jest.fn().mockReturnValue(mockEvent);

		mockElement = createMockElement();
		originalDocument = global.document;
		global.document = {
			querySelector: jest.fn()
		};
	});

	afterEach(() => {
		global.Event = originalEvent;
		global.document = originalDocument;
	});

	it('is a function', () => {
		expect(runAction).toEqual(expect.any(Function));
	});

	it('has an `actions` property', () => {
		expect(runAction.actions).toEqual(expect.any(Array));
	});

	it('has an `isValidAction` method', () => {
		expect(runAction.isValidAction).toEqual(expect.any(Function));
	});

	describe('runAction(browser, page, options, actionString)', () => {
		let options;
		let isolatedRunAction;

		const runIsolatedAction = actionStr => isolatedRunAction(puppeteer.mockBrowser, puppeteer.mockPage, options, actionStr);

		beforeEach(() => {
			options = {
				log: {
					debug: jest.fn()
				}
			};

			jest.isolateModules(() => {
				isolatedRunAction = require('../../../lib/action');
			});

			isolatedRunAction.actions = [
				{
					match: /^foo/,
					run: jest.fn().mockResolvedValue()
				},
				{
					match: /^bar/,
					run: jest.fn().mockResolvedValue()
				}
			];
		});

		it('calls the run function that matches the given `actionString`', async () => {
			const result = await runIsolatedAction('bar 123');

			expect(isolatedRunAction.actions[0].run).not.toHaveBeenCalled();
			expect(isolatedRunAction.actions[1].run).toHaveBeenCalledTimes(1);
			expect(isolatedRunAction.actions[1].run).toHaveBeenCalledWith(puppeteer.mockBrowser, puppeteer.mockPage, options, expect.any(Array));

			const match = isolatedRunAction.actions[1].run.mock.calls[0][3];
			expect(match.length).toEqual(1);
			expect(match[0]).toEqual('bar');

			expect(result).toBeUndefined();
		});

		describe('when `actionString` does not match an allowed action', () => {

			it('rejects with an error', async () => {
				await expect(runIsolatedAction('baz 123')).rejects.toThrowError('Failed action: "baz 123" cannot be resolved');
			});

		});

		describe('when the action runner rejects', () => {

			it('rejects with the action runner error', async () => {
				const actionRunnerError = new Error('action-runner-error');
				isolatedRunAction.actions[1].run.mockRejectedValueOnce(actionRunnerError);

				await expect(runIsolatedAction('bar 123')).rejects.toThrowError(actionRunnerError);
			});

		});

	});

	describe('.isValidAction(actionString)', () => {
		let isolatedRunAction;
		beforeEach(() => {
			jest.isolateModules(() => {
				isolatedRunAction = require('../../../lib/action');
			});

			isolatedRunAction.actions = [
				{
					match: /foo/i
				}
			];
		});

		it('returns `true` when the actionString matches one of the allowed actions', () => {
			expect(isolatedRunAction.isValidAction('hello foo!')).toEqual(true);
		});

		it('returns `false` when the actionString does not match any of the allowed actions', () => {
			expect(isolatedRunAction.isValidAction('hello bar!')).toEqual(false);
		});

	});

	describe('navigate-url action', () => {
		let navigateUrlAction;

		beforeEach(() => {
			navigateUrlAction = runAction.actions.find(foundAction => {
				return foundAction.name === 'navigate-url';
			});
		});

		describe('.match', () => {
			it('matches all of the expected action strings', () => {
				expect(Array.from('navigate to http://pa11y.org'.match(navigateUrlAction.match))).toEqual([
					'navigate to http://pa11y.org',
					undefined,
					'http://pa11y.org'
				]);
			});
		});

		describe('.run(browser, page, options, matches)', () => {
			let navigateUrlMatches;
			let navigateUrlResolvedValue;

			beforeEach(async () => {
				global.document.querySelector.mockReturnValue(mockElement);
				navigateUrlMatches = 'navigate to http://pa11y.org'.match(navigateUrlAction.match);
				navigateUrlResolvedValue = await navigateUrlAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, navigateUrlMatches);
			});

			it('clicks the specified element on the page', () => {
				expect(puppeteer.mockPage.goto).toHaveBeenCalledTimes(1);
				expect(puppeteer.mockPage.goto).toHaveBeenCalledWith(navigateUrlMatches[2]);
			});

			it('resolves with `undefined`', () => {
				expect(navigateUrlResolvedValue).toBeUndefined();
			});

			describe('when the click fails', () => {
				let navigateError;
				let navigateRejectedError;

				beforeEach(async () => {
					navigateError = new Error('navigate to error');
					puppeteer.mockPage.goto.mockRejectedValueOnce(navigateError);
					try {
						await navigateUrlAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, navigateUrlMatches);
					} catch (error) {
						navigateRejectedError = error;
					}
				});

				it('rejects with a new error', () => {
					expect(navigateRejectedError).not.toEqual(navigateError);
					expect(navigateRejectedError).toEqual(expect.any(Error));
					expect(navigateRejectedError.message).toEqual('Failed action: Could not navigate to "http://pa11y.org"');
				});
			});
		});
	});

	describe('click-element action', () => {
		let clickElementAction;

		beforeEach(() => {
			clickElementAction = runAction.actions.find(foundAction => {
				return foundAction.name === 'click-element';
			});
		});

		describe('.match', () => {

			it('matches all of the expected action strings', () => {
				expect(Array.from('click .foo'.match(clickElementAction.match))).toEqual([
					'click .foo',
					undefined,
					undefined,
					'.foo'
				]);
				expect(Array.from('click element .foo'.match(clickElementAction.match))).toEqual([
					'click element .foo',
					undefined,
					' element',
					'.foo'
				]);
				expect(Array.from('click element .foo .bar .baz'.match(clickElementAction.match))).toEqual([
					'click element .foo .bar .baz',
					undefined,
					' element',
					'.foo .bar .baz'
				]);
				expect(Array.from('double click element .foo .bar .baz'.match(clickElementAction.match))).toEqual([
					'double click element .foo .bar .baz',
					'double ',
					' element',
					'.foo .bar .baz'
				]);
			});

		});

		describe('.run(browser, page, options, matches)', () => {
			let clickElementMatches;
			let clickElementResolvedValue;

			describe('click', () => {

				beforeEach(async () => {
					global.document.querySelector.mockReturnValue(mockElement);
					clickElementMatches = 'click element foo'.match(clickElementAction.match);
					clickElementResolvedValue = await clickElementAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, clickElementMatches);
				});

				it('clicks the specified element on the page', () => {
					expect(puppeteer.mockPage.click).toHaveBeenCalledTimes(1);
					expect(puppeteer.mockPage.click).toHaveBeenCalledWith(clickElementMatches[3], {
						clickCount: 1
					});
				});

				it('resolves with `undefined`', () => {
					expect(clickElementResolvedValue).toBeUndefined();
				});

				describe('when the click fails', () => {
					let clickError;
					let clickElementRejectedError;

					beforeEach(async () => {
						clickError = new Error('click error');
						puppeteer.mockPage.click.mockRejectedValueOnce(clickError);
						try {
							await clickElementAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, clickElementMatches);
						} catch (error) {
							clickElementRejectedError = error;
						}
					});

					it('rejects with a new error', () => {
						expect(clickElementRejectedError).not.toEqual(clickError);
						expect(clickElementRejectedError).toEqual(expect.any(Error));
						expect(clickElementRejectedError.message).toEqual('Failed action: no element matching selector "foo"');
					});

				});
			});

			describe('double click', () => {

				beforeEach(async () => {
					global.document.querySelector.mockReturnValue(mockElement);
					clickElementMatches = 'double click element foo'.match(clickElementAction.match);
					clickElementResolvedValue = await clickElementAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, clickElementMatches);
				});


				it('double clicks the specified element on the page', () => {
					expect(puppeteer.mockPage.click).toHaveBeenCalledTimes(1);
					expect(puppeteer.mockPage.click).toHaveBeenCalledWith(clickElementMatches[3], {
						clickCount: 2
					});
				});

				it('resolves with `undefined`', () => {
					expect(clickElementResolvedValue).toBeUndefined();
				});

				describe('when the click fails', () => {
					let clickError;
					let clickElementRejectedError;

					beforeEach(async () => {
						clickError = new Error('click error');
						puppeteer.mockPage.click.mockRejectedValueOnce(clickError);
						try {
							await clickElementAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, clickElementMatches);
						} catch (error) {
							clickElementRejectedError = error;
						}
					});

					it('rejects with a new error', () => {
						expect(clickElementRejectedError).not.toEqual(clickError);
						expect(clickElementRejectedError).toEqual(expect.any(Error));
						expect(clickElementRejectedError.message).toEqual('Failed action: no element matching selector "foo"');
					});

				});

			})

		});

	});

	describe('set-field-value action', () => {
		let setFieldAction;

		beforeEach(() => {
			setFieldAction = runAction.actions.find(foundAction => {
				return foundAction.name === 'set-field-value';
			});
		});

		describe('.match', () => {

			it('matches all of the expected action strings', () => {
				expect(Array.from('set .foo to bar'.match(setFieldAction.match))).toEqual([
					'set .foo to bar',
					undefined,
					'.foo',
					'bar'
				]);
				expect(Array.from('set field .foo to bar'.match(setFieldAction.match))).toEqual([
					'set field .foo to bar',
					' field',
					'.foo',
					'bar'
				]);
				expect(Array.from('set field .foo .bar .baz to hello world'.match(setFieldAction.match))).toEqual([
					'set field .foo .bar .baz to hello world',
					' field',
					'.foo .bar .baz',
					'hello world'
				]);
				expect(Array.from('set field .foo to hello to the world'.match(setFieldAction.match))).toEqual([
					'set field .foo to hello to the world',
					' field',
					'.foo',
					'hello to the world'
				]);
			});

		});

		describe('.run(browser, page, options, matches)', () => {
			let setFieldMatches;
			let setFieldResolvedValue;

			beforeEach(async () => {
				global.document.querySelector.mockReturnValue(mockElement);
				setFieldMatches = 'set field foo to bar'.match(setFieldAction.match);
				await setFieldAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, setFieldMatches);
			});

			it('evaluates some JavaScript in the context of the page', () => {
				expect(puppeteer.mockPage.evaluate).toHaveBeenCalledTimes(1);
				expect(puppeteer.mockPage.evaluate.mock.calls[0][0]).toEqual(expect.any(Function));
				expect(puppeteer.mockPage.evaluate.mock.calls[0][1]).toEqual(setFieldMatches[2]);
				expect(puppeteer.mockPage.evaluate.mock.calls[0][2]).toEqual(setFieldMatches[3]);
			});

			describe('evaluated JavaScript', () => {
				beforeEach(async () => {
					setFieldResolvedValue = await puppeteer.mockPage.evaluate.mock.calls[0][0]('mock-selector', 'mock-value');
				});

				it('calls `document.querySelector` with the passed in selector', () => {
					expect(global.document.querySelector).toHaveBeenCalledTimes(1);
					expect(global.document.querySelector).toHaveBeenCalledWith('mock-selector');
				});

				it('sets the element `value` property to the passed in value', () => {
					expect(mockElement.value).toEqual('mock-value');
				});

				it('triggers an input event on the element', () => {
					expect(Event).toHaveBeenCalledTimes(1);
					expect(Event).toHaveBeenCalledWith('input', {
						bubbles: true
					});
					expect(mockElement.dispatchEvent).toHaveBeenCalledTimes(1);
					expect(mockElement.dispatchEvent).toHaveBeenCalledWith(mockEvent);
				});

				it('resolves with `undefined`', () => {
					expect(setFieldResolvedValue).toBeUndefined();
				});

				describe('with an element created from a prototype', () => {
					beforeEach(async () => {
						const mockPrototypeElement = createMockPrototypeElement();
						global.document.querySelector.mockReturnValue(mockPrototypeElement);
						setFieldResolvedValue = await puppeteer.mockPage.evaluate.mock.calls[0][0]('mock-selector', 'mock-value');
					});

					afterEach(() => {
						global.document = originalDocument;
					});

					it('calls `document.querySelector` with the passed in selector', () => {
						expect(global.document.querySelector).toHaveBeenCalledTimes(2);
						expect(global.document.querySelector).toHaveBeenCalledWith('mock-selector');
					});

					it('sets the element `value` property to the passed in value', () => {
						expect(mockElement.value).toEqual('mock-value');
					});

					it('triggers an input event on the element', () => {
						expect(Event).toHaveBeenCalledTimes(2);
						expect(Event).toHaveBeenCalledWith('input', {
							bubbles: true
						});
						expect(mockElement.dispatchEvent).toHaveBeenCalledTimes(1);
						expect(mockElement.dispatchEvent).toHaveBeenCalledWith(mockEvent);
					});

					it('resolves with `undefined`', () => {
						expect(setFieldResolvedValue).toBeUndefined();
					});
				});

				describe('when an element with the given selector cannot be found', () => {
					let rejectedError;

					beforeEach(async () => {
						global.document.querySelector.mockReturnValue(null);
						try {
							await puppeteer.mockPage.evaluate.mock.calls[0][0]('mock-selector', 'mock-value');
						} catch (error) {
							rejectedError = error;
						}
					});

					it('rejects with an error', () => {
						expect(rejectedError).toEqual(expect.any(Error));
					});

				});

			});

			it('resolves with `undefined`', () => {
				expect(setFieldResolvedValue).toBeUndefined();
			});

			describe('when the evaluate fails', () => {
				let evaluateError;
				let rejectedError;

				beforeEach(async () => {
					evaluateError = new Error('evaluate error');
					puppeteer.mockPage.evaluate.mockRejectedValueOnce(evaluateError);
					try {
						await setFieldAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, setFieldMatches);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with a new error', () => {
					expect(rejectedError).not.toEqual(evaluateError);
					expect(rejectedError).toEqual(expect.any(Error));
					expect(rejectedError.message).toEqual('Failed action: no element matching selector "foo"');
				});

			});

		});

	});


	describe('clear-field-value action', () => {
		let clearFieldAction;

		beforeEach(() => {
			clearFieldAction = runAction.actions.find(foundAction => {
				return foundAction.name === 'clear-field-value';
			});
		});

		describe('.match', () => {

			it('matches all of the expected action strings', () => {
				expect(Array.from('clear .foo'.match(clearFieldAction.match))).toEqual([
					'clear .foo',
					undefined,
					'.foo'
				]);
				expect(Array.from('clear field .foo'.match(clearFieldAction.match))).toEqual([
					'clear field .foo',
					' field',
					'.foo'
				]);
				expect(Array.from('clear field .foo .bar .baz'.match(clearFieldAction.match))).toEqual([
					'clear field .foo .bar .baz',
					' field',
					'.foo .bar .baz'
				]);
			});

		});

		describe('.run(browser, page, options, matches)', () => {
			let clearFieldActionMatches;
			let clearFieldActionResult;

			beforeEach(async () => {
				global.document.querySelector.mockReturnValue(mockElement);
				clearFieldActionMatches = 'clear field foo'.match(clearFieldAction.match);
				await clearFieldAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, clearFieldActionMatches);
			});

			it('evaluates some JavaScript in the context of the page', () => {
				expect(puppeteer.mockPage.evaluate).toHaveBeenCalledTimes(1);
				expect(puppeteer.mockPage.evaluate.mock.calls[0][0]).toEqual(expect.any(Function));
				expect(puppeteer.mockPage.evaluate.mock.calls[0][1]).toEqual(clearFieldActionMatches[2]);
			});

			describe('evaluated JavaScript', () => {
				let clearFieldResult;

				beforeEach(async () => {
					clearFieldResult = await puppeteer.mockPage.evaluate.mock.calls[0][0]('mock-selector', 'mock-value');
				});

				it('calls `document.querySelector` with the passed in selector', () => {
					expect(global.document.querySelector).toHaveBeenCalledTimes(1);
					expect(global.document.querySelector).toHaveBeenCalledWith('mock-selector');
				});

				it('sets the element `value` property to empty', () => {
					expect(mockElement.value).toEqual('');
				});

				it('triggers a change event on the element', () => {
					expect(Event).toHaveBeenCalledTimes(1);
					expect(Event).toHaveBeenCalledWith('input', {
						bubbles: true
					});
					expect(mockElement.dispatchEvent).toHaveBeenCalledTimes(1);
					expect(mockElement.dispatchEvent).toHaveBeenCalledWith(mockEvent);
				});

				it('resolves with `undefined`', () => {
					expect(clearFieldResult).toBeUndefined();
				});

				describe('with an element created from a prototype', () => {
					beforeEach(async () => {
						const mockPrototypeElement = createMockPrototypeElement();
						global.document.querySelector.mockReturnValue(mockPrototypeElement);
						clearFieldResult = await puppeteer.mockPage.evaluate.mock.calls[0][0]('mock-selector', 'mock-value');
					});

					afterEach(() => {
						global.document = originalDocument;
					});

					it('calls `document.querySelector` with the passed in selector', () => {
						expect(global.document.querySelector).toHaveBeenCalledTimes(2);
						expect(global.document.querySelector).toHaveBeenCalledWith('mock-selector');
					});

					it('clears the element `value` property to the passed in value', () => {
						expect(mockElement.value).toEqual('');
					});

					it('triggers an input event on the element', () => {
						expect(Event).toHaveBeenCalledTimes(2);
						expect(Event).toHaveBeenCalledWith('input', {
							bubbles: true
						});
						expect(mockElement.dispatchEvent).toHaveBeenCalledTimes(1);
						expect(mockElement.dispatchEvent).toHaveBeenCalledWith(mockEvent);
					});

					it('resolves with `undefined`', () => {
						expect(clearFieldResult).toBeUndefined();
					});
				});

				describe('when an element with the given selector cannot be found', () => {
					let rejectedError;

					beforeEach(async () => {
						global.document.querySelector.mockReturnValue(null);
						try {
							await puppeteer.mockPage.evaluate.mock.calls[0][0]('mock-selector', 'mock-value');
						} catch (error) {
							rejectedError = error;
						}
					});

					it('rejects with an error', () => {
						expect(rejectedError).toEqual(expect.any(Error));
					});

				});

			});

			it('resolves with `undefined`', () => {
				expect(clearFieldActionResult).toBeUndefined();
			});

			describe('when the evaluate fails', () => {
				let evaluateError;
				let rejectedError;

				beforeEach(async () => {
					evaluateError = new Error('evaluate error');
					puppeteer.mockPage.evaluate.mockRejectedValueOnce(evaluateError);
					try {
						await clearFieldAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, clearFieldActionMatches);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with a new error', () => {
					expect(rejectedError).not.toEqual(evaluateError);
					expect(rejectedError).toEqual(expect.any(Error));
					expect(rejectedError.message).toEqual('Failed action: no element matching selector "foo"');
				});

			});

		});
	});

	describe('check-field action', () => {
		let checkFieldAction;

		beforeEach(() => {
			checkFieldAction = runAction.actions.find(foundAction => {
				return foundAction.name === 'check-field';
			});
		});

		describe('.match', () => {

			it('matches all of the expected action strings', () => {
				expect(Array.from('check .foo'.match(checkFieldAction.match))).toEqual([
					'check .foo',
					'check',
					undefined,
					'.foo'
				]);
				expect(Array.from('check field .foo'.match(checkFieldAction.match))).toEqual([
					'check field .foo',
					'check',
					' field',
					'.foo'
				]);
				expect(Array.from('uncheck field .foo .bar .baz'.match(checkFieldAction.match))).toEqual([
					'uncheck field .foo .bar .baz',
					'uncheck',
					' field',
					'.foo .bar .baz'
				]);
			});

		});

		describe('.run(browser, page, options, matches)', () => {
			let checkFieldMatches;
			let checkFieldActionResult;

			beforeEach(async () => {
				checkFieldMatches = 'check field foo'.match(checkFieldAction.match);
				checkFieldActionResult = await checkFieldAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, checkFieldMatches);
			});

			it('evaluates some JavaScript in the context of the page', () => {
				expect(puppeteer.mockPage.evaluate).toHaveBeenCalledTimes(1);
				expect(puppeteer.mockPage.evaluate.mock.calls[0][0]).toEqual(expect.any(Function));
				expect(puppeteer.mockPage.evaluate.mock.calls[0][1]).toEqual(checkFieldMatches[3]);
				expect(puppeteer.mockPage.evaluate.mock.calls[0][2]).toEqual(true);
			});

			describe('evaluated JavaScript', () => {
				let checkFieldResult;

				beforeEach(async () => {
					global.document.querySelector.mockReturnValue(mockElement);
					checkFieldResult = await puppeteer.mockPage.evaluate.mock.calls[0][0]('mock-selector', 'mock-checked');
				});

				it('calls `document.querySelector` with the passed in selector', () => {
					expect(global.document.querySelector).toHaveBeenCalledTimes(1);
					expect(global.document.querySelector).toHaveBeenCalledWith('mock-selector');
				});

				it('sets the element `checked` property to the passed in checked value', () => {
					expect(mockElement.checked).toEqual('mock-checked');
				});

				it('triggers a change event on the element', () => {
					expect(Event).toHaveBeenCalledTimes(1);
					expect(Event).toHaveBeenCalledWith('change', {
						bubbles: true
					});
					expect(mockElement.dispatchEvent).toHaveBeenCalledTimes(1);
					expect(mockElement.dispatchEvent).toHaveBeenCalledWith(mockEvent);
				});

				it('resolves with `undefined`', () => {
					expect(checkFieldResult).toBeUndefined();
				});

				describe('when an element with the given selector cannot be found', () => {
					let rejectedError;

					beforeEach(async () => {
						global.document.querySelector.mockReturnValue(null);
						try {
							await puppeteer.mockPage.evaluate.mock.calls[0][0]('mock-selector', 'mock-checked');
						} catch (error) {
							rejectedError = error;
						}
					});

					it('rejects with an error', () => {
						expect(rejectedError).toEqual(expect.any(Error));
					});

				});

			});

			it('resolves with `undefined`', () => {
				expect(checkFieldActionResult).toBeUndefined();
			});

			describe('when `matches` indicates that the field should be unchecked', () => {
				beforeEach(async () => {
					puppeteer.mockPage.evaluate.mockReset();
					checkFieldMatches = 'uncheck field foo'.match(checkFieldAction.match);
					await checkFieldAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, checkFieldMatches);
				});

				it('passes a `false` negation parameter into the evaluate', () => {
					expect(puppeteer.mockPage.evaluate).toHaveBeenCalledTimes(1);
					expect(puppeteer.mockPage.evaluate.mock.calls[0][2]).toEqual(false);
				});

			});

			describe('when the evaluate fails', () => {
				let evaluateError;
				let rejectedError;

				beforeEach(async () => {
					evaluateError = new Error('evaluate error');
					puppeteer.mockPage.evaluate.mockRejectedValueOnce(evaluateError);
					try {
						await checkFieldAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, checkFieldMatches);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with a new error', () => {
					expect(rejectedError).not.toEqual(evaluateError);
					expect(rejectedError).toEqual(expect.any(Error));
					expect(rejectedError.message).toEqual('Failed action: no element matching selector "foo"');
				});

			});

		});

	});

	describe('screen-capture action', () => {
		let screenCaptureAction;

		beforeEach(() => {
			screenCaptureAction = runAction.actions.find(foundAction => {
				return foundAction.name === 'screen-capture';
			});
		});

		describe('.match', () => {

			it('matches all of the expected action strings', () => {
				expect(Array.from('screen capture foo.png'.match(screenCaptureAction.match))).toEqual([
					'screen capture foo.png',
					'screen capture',
					undefined,
					'foo.png'
				]);
				expect(Array.from('screen-capture foo.png'.match(screenCaptureAction.match))).toEqual([
					'screen-capture foo.png',
					'screen-capture',
					undefined,
					'foo.png'
				]);
				expect(Array.from('capture screen to foo.png'.match(screenCaptureAction.match))).toEqual([
					'capture screen to foo.png',
					'capture screen',
					' to',
					'foo.png'
				]);
			});

		});

		describe('.run(browser, page, options, matches)', () => {
			let screenCaptureMatches;
			let screenCaptureResult;

			beforeEach(async () => {
				screenCaptureMatches = 'screen capture foo.png'.match(screenCaptureAction.match);
				screenCaptureResult = await screenCaptureAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, screenCaptureMatches);
			});

			it('captures the full screen', () => {
				expect(puppeteer.mockPage.screenshot).toHaveBeenCalledTimes(1);
				expect(puppeteer.mockPage.screenshot).toHaveBeenCalledWith({
					path: screenCaptureMatches[3],
					fullPage: true
				});
			});

			it('resolves with `undefined`', () => {
				expect(screenCaptureResult).toBeUndefined();
			});

			describe('when the screen capture fails', () => {
				let screenCaptureError;
				let rejectedError;

				beforeEach(async () => {
					screenCaptureError = new Error('screen capture error');
					puppeteer.mockPage.screenshot.mockRejectedValueOnce(screenCaptureError);
					try {
						await screenCaptureAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, screenCaptureMatches);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with the error', () => {
					expect(rejectedError).toEqual(screenCaptureError);
				});

			});

		});

	});

	describe('wait-for-url action', () => {
		let action;

		beforeEach(() => {
			action = runAction.actions.find(foundAction => foundAction.name === 'wait-for-url');
		});

		it('has a name property', () => {
			expect(action.name).toEqual('wait-for-url');
		});

		it('has a match property', () => {
			expect(action.match).toEqual(expect.any(RegExp));
		});

		describe('.match', () => {

			it('matches all of the expected action strings', () => {
				expect(Array.from('wait for fragment #foo'.match(action.match))).toEqual([
					'wait for fragment #foo',
					'fragment',
					undefined,
					undefined,
					'#foo'
				]);
				expect(Array.from('wait for fragment to be #foo'.match(action.match))).toEqual([
					'wait for fragment to be #foo',
					'fragment',
					' to be',
					undefined,
					'#foo'
				]);
				expect(Array.from('wait for hash to be #foo'.match(action.match))).toEqual([
					'wait for hash to be #foo',
					'hash',
					' to be',
					undefined,
					'#foo'
				]);
				expect(Array.from('wait for path to be /foo'.match(action.match))).toEqual([
					'wait for path to be /foo',
					'path',
					' to be',
					undefined,
					'/foo'
				]);
				expect(Array.from('wait for host to be example.com'.match(action.match))).toEqual([
					'wait for host to be example.com',
					'host',
					' to be',
					undefined,
					'example.com'
				]);
				expect(Array.from('wait for url to be https://example.com/'.match(action.match))).toEqual([
					'wait for url to be https://example.com/',
					'url',
					' to be',
					undefined,
					'https://example.com/'
				]);
				expect(Array.from('wait for fragment to not be #bar'.match(action.match))).toEqual([
					'wait for fragment to not be #bar',
					'fragment',
					' to not be',
					'not ',
					'#bar'
				]);
				expect(Array.from('wait for hash to not be #bar'.match(action.match))).toEqual([
					'wait for hash to not be #bar',
					'hash',
					' to not be',
					'not ',
					'#bar'
				]);
				expect(Array.from('wait for path to not be /sso/login'.match(action.match))).toEqual([
					'wait for path to not be /sso/login',
					'path',
					' to not be',
					'not ',
					'/sso/login'
				]);
				expect(Array.from('wait for path to not be /oam/server/auth_cred_submit'.match(action.match))).toEqual([
					'wait for path to not be /oam/server/auth_cred_submit',
					'path',
					' to not be',
					'not ',
					'/oam/server/auth_cred_submit'
				]);
				expect(Array.from('wait for host to not be example.com'.match(action.match))).toEqual([
					'wait for host to not be example.com',
					'host',
					' to not be',
					'not ',
					'example.com'
				]);
				expect('wait for path not to be /account/signin/'.match(action.match)).toEqual(null);
			});

		});

		describe('.run(browser, page, options, matches)', () => {
			let waitForUrlMatches;
			let waitForUrlValue;

			beforeEach(async () => {
				waitForUrlMatches = 'wait for path to be foo'.match(action.match);
				waitForUrlValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, waitForUrlMatches);
			});

			it('waits for a function to evaluate to `true`', () => {
				expect(puppeteer.mockPage.waitForFunction).toHaveBeenCalledTimes(1);
				expect(puppeteer.mockPage.waitForFunction.mock.calls[0][0]).toEqual(expect.any(Function));
				expect(puppeteer.mockPage.waitForFunction.mock.calls[0][1]).toEqual({});
				expect(puppeteer.mockPage.waitForFunction.mock.calls[0][2]).toEqual('pathname');
				expect(puppeteer.mockPage.waitForFunction.mock.calls[0][3]).toEqual(waitForUrlMatches[4]);
				expect(puppeteer.mockPage.waitForFunction.mock.calls[0][4]).toEqual(false);
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
					global.document.querySelector.mockReturnValue(mockElement);
					returnValue = puppeteer.mockPage.waitForFunction.mock.calls[0][0]('mock-property', 'value', false);
				});

				afterEach(() => {
					global.window = originalWindow;
				});

				it('returns `true`', () => {
					expect(returnValue).toEqual(true);
				});

				describe('when the location property does not match the expected value', () => {

					beforeEach(() => {
						returnValue = puppeteer.mockPage.waitForFunction.mock.calls[0][0]('mock-property', 'incorrect-value', false);
					});

					it('returns `false`', () => {
						expect(returnValue).toEqual(false);
					});

				});

				describe('when the negated property is `true`', () => {

					beforeEach(() => {
						returnValue = puppeteer.mockPage.waitForFunction.mock.calls[0][0]('mock-property', 'value', true);
					});

					it('returns `false`', () => {
						expect(returnValue).toEqual(false);
					});

				});

				describe('when the negated property is `true` and the location property does not match the expected value', () => {

					beforeEach(() => {
						returnValue = puppeteer.mockPage.waitForFunction.mock.calls[0][0]('mock-property', 'incorrect-value', true);
					});

					it('returns `true`', () => {
						expect(returnValue).toEqual(true);
					});

				});

			});

			it('resolves with `undefined`', () => {
				expect(waitForUrlValue).toBeUndefined();
			});

			describe('when `matches` indicates that the subject is "fragment"', () => {

				beforeEach(async () => {
					puppeteer.mockPage.waitForFunction.mockReset();
					waitForUrlMatches = 'wait for fragment to be foo'.match(action.match);
					waitForUrlValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, waitForUrlMatches);
				});

				it('passes the expected property name into the wait function', () => {
					expect(puppeteer.mockPage.waitForFunction).toHaveBeenCalledTimes(1);
					expect(puppeteer.mockPage.waitForFunction.mock.calls[0][2]).toEqual('hash');
				});

			});

			describe('when `matches` indicates that the subject is "hash"', () => {

				beforeEach(async () => {
					puppeteer.mockPage.waitForFunction.mockReset();
					waitForUrlMatches = 'wait for hash to be foo'.match(action.match);
					waitForUrlValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, waitForUrlMatches);
				});

				it('passes the expected property name into the wait function', () => {
					expect(puppeteer.mockPage.waitForFunction.mock.calls[0][2]).toEqual('hash');
				});

			});

			describe('when `matches` indicates that the subject is "host"', () => {

				beforeEach(async () => {
					puppeteer.mockPage.waitForFunction.mockReset();
					waitForUrlMatches = 'wait for host to be foo'.match(action.match);
					waitForUrlValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, waitForUrlMatches);
				});

				it('passes the expected property name into the wait function', () => {
					expect(puppeteer.mockPage.waitForFunction.mock.calls[0][2]).toEqual('host');
				});

			});

			describe('when `matches` indicates that the subject is "url"', () => {

				beforeEach(async () => {
					puppeteer.mockPage.waitForFunction.mockReset();
					waitForUrlMatches = 'wait for url to be foo'.match(action.match);
					waitForUrlValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, waitForUrlMatches);
				});

				it('passes the expected property name into the wait function', () => {
					expect(puppeteer.mockPage.waitForFunction.mock.calls[0][2]).toEqual('href');
				});

			});

			describe('when `matches` includes a negation like "to not be"', () => {

				beforeEach(async () => {
					puppeteer.mockPage.waitForFunction.mockReset();
					waitForUrlMatches = 'wait for path to not be foo'.match(action.match);
					waitForUrlValue = await action.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, waitForUrlMatches);
				});

				it('passes a `true` negation parameter into the wait function', () => {
					expect(puppeteer.mockPage.waitForFunction.mock.calls[0][4]).toEqual(true);
				});

			});

		});

	});

	describe('wait-for-element-state action', () => {
		let waitForElementAction;

		beforeEach(() => {
			waitForElementAction = runAction.actions.find(foundAction => foundAction.name === 'wait-for-element-state');
		});

		describe('.match', () => {

			it('matches all of the expected action strings', () => {
				expect(Array.from('wait for .foo to be added'.match(waitForElementAction.match))).toEqual([
					'wait for .foo to be added',
					undefined,
					'.foo',
					' to be',
					'added'
				]);
				expect(Array.from('wait for element .foo to be added'.match(waitForElementAction.match))).toEqual([
					'wait for element .foo to be added',
					' element',
					'.foo',
					' to be',
					'added'
				]);
				expect(Array.from('wait for element .foo .bar to be added'.match(waitForElementAction.match))).toEqual([
					'wait for element .foo .bar to be added',
					' element',
					'.foo .bar',
					' to be',
					'added'
				]);
				expect(Array.from('wait for .foo to be removed'.match(waitForElementAction.match))).toEqual([
					'wait for .foo to be removed',
					undefined,
					'.foo',
					' to be',
					'removed'
				]);
				expect(Array.from('wait for element .foo to be removed'.match(waitForElementAction.match))).toEqual([
					'wait for element .foo to be removed',
					' element',
					'.foo',
					' to be',
					'removed'
				]);
				expect(Array.from('wait for element .foo .bar to be removed'.match(waitForElementAction.match))).toEqual([
					'wait for element .foo .bar to be removed',
					' element',
					'.foo .bar',
					' to be',
					'removed'
				]);
				expect(Array.from('wait for .foo to be visible'.match(waitForElementAction.match))).toEqual([
					'wait for .foo to be visible',
					undefined,
					'.foo',
					' to be',
					'visible'
				]);
				expect(Array.from('wait for element .foo to be visible'.match(waitForElementAction.match))).toEqual([
					'wait for element .foo to be visible',
					' element',
					'.foo',
					' to be',
					'visible'
				]);
				expect(Array.from('wait for element .foo .bar to be visible'.match(waitForElementAction.match))).toEqual([
					'wait for element .foo .bar to be visible',
					' element',
					'.foo .bar',
					' to be',
					'visible'
				]);
				expect(Array.from('wait for .foo to be hidden'.match(waitForElementAction.match))).toEqual([
					'wait for .foo to be hidden',
					undefined,
					'.foo',
					' to be',
					'hidden'
				]);
				expect(Array.from('wait for element .foo to be hidden'.match(waitForElementAction.match))).toEqual([
					'wait for element .foo to be hidden',
					' element',
					'.foo',
					' to be',
					'hidden'
				]);
				expect(Array.from('wait for element .foo .bar to be hidden'.match(waitForElementAction.match))).toEqual([
					'wait for element .foo .bar to be hidden',
					' element',
					'.foo .bar',
					' to be',
					'hidden'
				]);
			});

		});

		describe('.run(browser, page, options, matches)', () => {
			let matches;
			let resolvedValue;

			beforeEach(async () => {
				matches = 'wait for element .foo to be added'.match(waitForElementAction.match);
				resolvedValue = await waitForElementAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
			});

			it('waits for a function to evaluate to `true`', () => {
				expect(puppeteer.mockPage.waitForFunction).toHaveBeenCalledTimes(1);
				expect(puppeteer.mockPage.waitForFunction.mock.calls[0][0]).toEqual(expect.any(Function));
				expect(puppeteer.mockPage.waitForFunction.mock.calls[0][1]).toEqual({
					polling: 200
				});
				expect(puppeteer.mockPage.waitForFunction.mock.calls[0][2]).toEqual(matches[2]);
				expect(puppeteer.mockPage.waitForFunction.mock.calls[0][3]).toEqual(matches[4]);
			});

			describe('evaluated JavaScript', () => {
				let waitForReturnValue;

				beforeEach(() => {
					global.document.querySelector.mockReturnValue(null);
					waitForReturnValue = puppeteer.mockPage.waitForFunction.mock.calls[0][0]('mock-selector', 'mock-state');
				});

				it('calls `document.querySelector` with the passed in selector', () => {
					expect(global.document.querySelector).toHaveBeenCalledTimes(1);
					expect(global.document.querySelector).toHaveBeenCalledWith('mock-selector');
				});

				it('returns `false`', () => {
					expect(waitForReturnValue).toEqual(false);
				});

				describe('when the selector returns an element and the state is "added"', () => {

					beforeEach(() => {
						global.document.querySelector.mockReturnValue(mockElement);
						waitForReturnValue = puppeteer.mockPage.waitForFunction.mock.calls[0][0]('mock-selector', 'added');
					});

					it('returns `true`', () => {
						expect(waitForReturnValue).toEqual(true);
					});

				});

				describe('when the selector does not return an element and the state is "added"', () => {

					beforeEach(() => {
						waitForReturnValue = puppeteer.mockPage.waitForFunction.mock.calls[0][0]('mock-selector', 'added');
					});

					it('returns `false`', () => {
						expect(waitForReturnValue).toEqual(false);
					});

				});

				describe('when the selector does not return an element and the state is "removed"', () => {

					beforeEach(() => {
						waitForReturnValue = puppeteer.mockPage.waitForFunction.mock.calls[0][0]('mock-selector', 'removed');
					});

					it('returns `true`', () => {
						expect(waitForReturnValue).toEqual(true);
					});

				});

				describe('when the selector returns an element and the state is "removed"', () => {

					beforeEach(() => {
						global.document.querySelector.mockReturnValue(mockElement);
						waitForReturnValue = puppeteer.mockPage.waitForFunction.mock.calls[0][0]('mock-selector', 'removed');
					});

					it('returns `false`', () => {
						expect(waitForReturnValue).toEqual(false);
					});

				});

				describe('when the selector returns a visible element and the state is "visible"', () => {

					beforeEach(() => {
						mockElement.offsetWidth = 100;
						global.document.querySelector.mockReturnValue(mockElement);
						waitForReturnValue = puppeteer.mockPage.waitForFunction.mock.calls[0][0]('mock-selector', 'visible');
					});

					it('returns `true`', () => {
						expect(waitForReturnValue).toEqual(true);
					});

				});

				describe('when the selector returns a hidden element and the state is "visible"', () => {

					beforeEach(() => {
						global.document.querySelector.mockReturnValue(mockElement);
						waitForReturnValue = puppeteer.mockPage.waitForFunction.mock.calls[0][0]('mock-selector', 'visible');
					});

					it('returns `false`', () => {
						expect(waitForReturnValue).toEqual(false);
					});

				});

				describe('when the selector returns a hidden element and the state is "hidden"', () => {

					beforeEach(() => {
						global.document.querySelector.mockReturnValue(mockElement);
						waitForReturnValue = puppeteer.mockPage.waitForFunction.mock.calls[0][0]('mock-selector', 'hidden');
					});

					it('returns `true`', () => {
						expect(waitForReturnValue).toEqual(true);
					});

				});

				describe('when the selector returns a visible element and the state is "hidden"', () => {

					beforeEach(() => {
						mockElement.offsetWidth = 100;
						global.document.querySelector.mockReturnValue(mockElement);
						waitForReturnValue = puppeteer.mockPage.waitForFunction.mock.calls[0][0]('mock-selector', 'hidden');
					});

					it('returns `false`', () => {
						expect(waitForReturnValue).toEqual(false);
					});

				});

			});

			it('resolves with `undefined`', () => {
				expect(resolvedValue).toBeUndefined();
			});

			describe('when `matches` indicates that the state is "removed"', () => {

				beforeEach(async () => {
					puppeteer.mockPage.waitForFunction.mockReset();
					matches = 'wait for element .foo to be removed'.match(waitForElementAction.match);
					resolvedValue = await waitForElementAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes the expected state into the wait function', () => {
					expect(puppeteer.mockPage.waitForFunction).toHaveBeenCalledTimes(1);
					expect(puppeteer.mockPage.waitForFunction.mock.calls[0][3]).toEqual('removed');
				});

			});

			describe('when `matches` indicates that the state is "visible"', () => {

				beforeEach(async () => {
					puppeteer.mockPage.waitForFunction.mockReset();
					matches = 'wait for element .foo to be visible'.match(waitForElementAction.match);
					resolvedValue = await waitForElementAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes the expected state into the wait function', () => {
					expect(puppeteer.mockPage.waitForFunction.mock.calls[0][3]).toEqual('visible');
				});

			});

			describe('when `matches` indicates that the state is "hidden"', () => {

				beforeEach(async () => {
					puppeteer.mockPage.waitForFunction.mockReset();
					matches = 'wait for element .foo to be hidden'.match(waitForElementAction.match);
					resolvedValue = await waitForElementAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
				});

				it('passes the expected state into the wait function', () => {
					expect(puppeteer.mockPage.waitForFunction.mock.calls[0][3]).toEqual('hidden');
				});

			});

		});

	});

	describe('wait-for-element-event action', () => {
		let waitForElementAction;

		beforeEach(() => {
			waitForElementAction = runAction.actions.find(foundAction => foundAction.name === 'wait-for-element-event');
		});

		describe('.match', () => {

			it('matches all of the expected action strings', () => {
				expect(Array.from('wait for element .foo to emit bar'.match(waitForElementAction.match))).toEqual([
					'wait for element .foo to emit bar',
					' element',
					'.foo',
					'bar'
				]);
				expect(Array.from('wait for element .foo .bar to emit baz-qux'.match(waitForElementAction.match))).toEqual([
					'wait for element .foo .bar to emit baz-qux',
					' element',
					'.foo .bar',
					'baz-qux'
				]);
				expect(Array.from('wait for .foo to emit bar'.match(waitForElementAction.match))).toEqual([
					'wait for .foo to emit bar',
					undefined,
					'.foo',
					'bar'
				]);
			});

		});

		describe('.run(browser, page, options, matches)', () => {
			let matches;
			let resolvedValue;

			beforeEach(async () => {
				global.document.querySelector.mockReturnValue(mockElement);
				matches = 'wait for element foo to emit bar'.match(waitForElementAction.match);
				resolvedValue = await waitForElementAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
			});

			it('evaluates some JavaScript in the context of the page', () => {
				expect(puppeteer.mockPage.evaluate).toHaveBeenCalledTimes(1);
				expect(puppeteer.mockPage.evaluate.mock.calls[0][0]).toEqual(expect.any(Function));
				expect(puppeteer.mockPage.evaluate.mock.calls[0][1]).toEqual(matches[2]);
				expect(puppeteer.mockPage.evaluate.mock.calls[0][2]).toEqual(matches[3]);
			});

			describe('evaluated JavaScript (evaluate)', () => {
				beforeEach(async () => {
					resolvedValue = await puppeteer.mockPage.evaluate.mock.calls[0][0]('mock-selector', 'mock-event-type');
				});

				it('calls `document.querySelector` with the passed in selector', () => {
					expect(global.document.querySelector).toHaveBeenCalledTimes(1);
					expect(global.document.querySelector).toHaveBeenCalledWith('mock-selector');
				});

				it('adds a one-time event handler to the element for the passed in event type', () => {
					expect(mockElement.addEventListener).toHaveBeenCalledTimes(1);
					expect(mockElement.addEventListener.mock.calls[0][0]).toEqual('mock-event-type');
					expect(mockElement.addEventListener.mock.calls[0][1]).toEqual(expect.any(Function));
					expect(mockElement.addEventListener.mock.calls[0][2]).toEqual({
						once: true
					});
				});

				describe('event handler', () => {
					let originalWindow;

					beforeEach(() => {
						originalWindow = global.window;
						global.window = {};
						mockElement.addEventListener.mock.calls[0][1]();
					});

					afterEach(() => {
						global.window = originalWindow;
					});

					it('sets `window._pa11yWaitForElementEventFired` to `true`', () => {
						/* eslint-disable no-underscore-dangle */
						expect(window._pa11yWaitForElementEventFired).toEqual(true);
						/* eslint-enable no-underscore-dangle */
					});

				});

				it('resolves with `undefined`', () => {
					expect(resolvedValue).toBeUndefined();
				});

				describe('when an element with the given selector cannot be found', () => {
					let rejectedError;

					beforeEach(async () => {
						global.document.querySelector.mockReturnValue(null);
						try {
							await puppeteer.mockPage.evaluate.mock.calls[0][0]('mock-selector', 'mock-event-type');
						} catch (error) {
							rejectedError = error;
						}
					});

					it('rejects with an error', () => {
						expect(rejectedError).toEqual(expect.any(Error));
					});

				});

			});

			it('waits for a function to evaluate to `true`', () => {
				expect(puppeteer.mockPage.waitForFunction).toHaveBeenCalledTimes(1);
				expect(puppeteer.mockPage.waitForFunction.mock.calls[0][0]).toEqual(expect.any(Function));
				expect(puppeteer.mockPage.waitForFunction.mock.calls[0][1]).toEqual({
					polling: 200
				});
			});

			describe('evaluated JavaScript (wait for function)', () => {
				let originalWindow;
				let returnValue;

				beforeEach(() => {
					originalWindow = global.window;
					global.window = {};
					returnValue = puppeteer.mockPage.waitForFunction.mock.calls[0][0]();
				});

				afterEach(() => {
					global.window = originalWindow;
				});

				it('returns `false`', () => {
					expect(returnValue).toEqual(false);
				});

				describe('when `window._pa11yWaitForElementEventFired` is `true`', () => {

					beforeEach(() => {
						/* eslint-disable no-underscore-dangle */
						global.window._pa11yWaitForElementEventFired = true;
						/* eslint-enable no-underscore-dangle */
						returnValue = puppeteer.mockPage.waitForFunction.mock.calls[0][0]();
					});

					it('returns `true`', () => {
						expect(returnValue).toEqual(true);
					});

					it('deletes the `window._pa11yWaitForElementEventFired` variable', () => {
						/* eslint-disable no-underscore-dangle */
						expect(global.window._pa11yWaitForElementEventFired).toBeUndefined();
						/* eslint-enable no-underscore-dangle */
					});

				});

			});

			it('resolves with `undefined`', () => {
				expect(resolvedValue).toBeUndefined();
			});

			describe('when the evaluate fails', () => {
				let evaluateError;
				let rejectedError;

				beforeEach(async () => {
					evaluateError = new Error('evaluate error');
					puppeteer.mockPage.evaluate.mockRejectedValueOnce(evaluateError);
					try {
						await waitForElementAction.run(puppeteer.mockBrowser, puppeteer.mockPage, {}, matches);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with a new error', () => {
					expect(rejectedError).not.toEqual(evaluateError);
					expect(rejectedError).toEqual(expect.any(Error));
					expect(rejectedError.message).toEqual('Failed action: no element matching selector "foo"');
				});

			});

		});

	});

});

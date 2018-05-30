'use strict';

const assert = require('proclaim');
const {createMockElement} = require('../mock/element.mock');
const sinon = require('sinon');

describe('lib/runner', () => {
	let pa11y;
	let runner;

	beforeEach(() => {
		runner = require('../../../lib/runner');
		/* eslint-disable no-underscore-dangle */
		pa11y = runner.__pa11y;
		/* eslint-enable no-underscore-dangle */
	});

	it('is an object', () => {
		assert.isObject(runner);
	});

	describe('.__pa11y', () => {
		let originalWindow;

		beforeEach(() => {
			originalWindow = global.window;
			global.window = require('../mock/window.mock');
		});

		afterEach(() => {
			global.window = originalWindow;
		});

		it('is an object', () => {
			assert.isObject(pa11y);
		});

		describe('.run(options)', () => {
			let options;
			let resolvedValue;
			let mockIssues;

			beforeEach(async () => {
				options = {
					ignore: [],
					rootElement: null,
					rules: [],
					standard: 'mock-standard',
					pa11yVersion: '1.2.3',
					runners: [
						'mock-runner'
					],
					wait: 0
				};
				mockIssues = [
					{
						code: 'mock-code',
						element: createMockElement(),
						message: 'mock issue',
						type: 'error'
					}
				];
				pa11y.runners['mock-runner'] = sinon.stub().resolves(mockIssues);
				resolvedValue = await pa11y.run(options);
			});

			it('sets `__pa11y.version` to the `pa11yVersion` option', () => {
				assert.strictEqual(pa11y.version, '1.2.3');
			});

			it('runs all of the specified runners with the options and runner', () => {
				assert.calledOnce(pa11y.runners['mock-runner']);
				assert.calledWithExactly(pa11y.runners['mock-runner'], options, pa11y);
			});

			it('resolves with page details and an array of issues', () => {
				assert.isObject(resolvedValue);
				assert.strictEqual(resolvedValue.documentTitle, window.document.title);
				assert.strictEqual(resolvedValue.pageUrl, window.location.href);
				assert.isArray(resolvedValue.issues);
				assert.deepEqual(resolvedValue.issues, [
					{
						code: 'mock-code',
						context: '<element>mock-html</element>',
						message: 'mock issue',
						selector: 'element',
						runner: 'mock-runner',
						runnerExtras: {},
						type: 'error',
						typeCode: 1
					}
				]);
			});

			describe('when the document title is not set', () => {

				beforeEach(async () => {
					delete window.document.title;
					pa11y.runners['mock-runner'].returns([]);
					resolvedValue = await pa11y.run(options);
				});

				it('resolves with an empty `documentTitle` property', () => {
					assert.strictEqual(resolvedValue.documentTitle, '');
				});

			});

			describe('when the location href is not set', () => {

				beforeEach(async () => {
					delete window.location.href;
					pa11y.runners['mock-runner'].returns([]);
					resolvedValue = await pa11y.run(options);
				});

				it('resolves with an empty `pageUrl` property', () => {
					assert.strictEqual(resolvedValue.pageUrl, '');
				});

			});

			describe('when an issue type is not found', () => {

				beforeEach(async () => {
					pa11y.runners['mock-runner'].returns([
						{
							code: 'mock-code',
							element: createMockElement(),
							message: 'mock issue',
							type: 'not-a-type'
						}
					]);
					resolvedValue = await pa11y.run(options);
				});

				it('resolves with a `typeCode` of 0', () => {
					assert.strictEqual(resolvedValue.issues[0].typeCode, 0);
				});

			});

			describe('when the runner errors', () => {
				let rejectedError;
				let runnerError;

				beforeEach(async () => {
					runnerError = new Error('HTML CodeSniffer error');
					pa11y.runners['mock-runner'].rejects(runnerError);
					try {
						await pa11y.run(options);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with that error', () => {
					assert.strictEqual(rejectedError, runnerError);
				});

			});

			describe('when `options.ignore` includes an issue type', () => {

				beforeEach(async () => {
					pa11y.runners['mock-runner'].returns([
						{
							code: 'mock-error',
							element: createMockElement(),
							message: 'mock issue 1',
							type: 'error'
						},
						{
							code: 'mock-warning',
							element: createMockElement(),
							message: 'mock issue 2',
							type: 'warning'
						}
					]);
					options.ignore = [
						'error'
					];
					resolvedValue = await pa11y.run(options);
				});

				it('does not resolve with issues of that type', () => {
					assert.deepEqual(resolvedValue.issues, [
						{
							code: 'mock-warning',
							context: '<element>mock-html</element>',
							message: 'mock issue 2',
							selector: 'element',
							runner: 'mock-runner',
							runnerExtras: {},
							type: 'warning',
							typeCode: 2
						}
					]);
				});

			});

			describe('when `options.ignore` includes an issue code', () => {

				beforeEach(async () => {
					pa11y.runners['mock-runner'].returns([
						{
							code: 'mock-code-1',
							context: '<element>mock-html</element>',
							element: createMockElement(),
							message: 'mock issue 1',
							selector: 'element',
							type: 'error'
						},
						{
							code: 'mock-code-2',
							context: '<element>mock-html</element>',
							element: createMockElement(),
							message: 'mock issue 2',
							selector: 'element',
							type: 'error'
						}
					]);
					options.ignore = [
						'mock-code-1'
					];
					resolvedValue = await pa11y.run(options);
				});

				it('does not resolve with issues with that code', () => {
					assert.deepEqual(resolvedValue.issues, [
						{
							code: 'mock-code-2',
							context: '<element>mock-html</element>',
							message: 'mock issue 2',
							selector: 'element',
							runner: 'mock-runner',
							runnerExtras: {},
							type: 'error',
							typeCode: 1
						}
					]);
				});

				describe('when the issue code case does not match', () => {

					beforeEach(async () => {
						pa11y.runners['mock-runner'].returns([
							{
								code: 'MOCK-CODE',
								context: '<element>mock-html</element>',
								element: createMockElement(),
								message: 'mock issue',
								selector: 'element',
								type: 'error'
							}
						]);
						options.ignore = [
							'mock-code'
						];
						resolvedValue = await pa11y.run(options);
					});

					it('still does not resolve with issues with that code', () => {
						assert.deepEqual(resolvedValue.issues, []);
					});

				});

			});

			describe('when `options.rootElement` is set', () => {
				let insideElement;
				let outsideElement;
				let rootElement;

				beforeEach(async () => {
					insideElement = createMockElement({
						id: 'mock-inside-element'
					});
					outsideElement = createMockElement({
						id: 'mock-outside-element'
					});
					rootElement = createMockElement({
						id: 'root-element'
					});

					global.window.document.querySelector.withArgs('#root-element').returns(rootElement);

					rootElement.contains.withArgs(insideElement).returns(true);
					rootElement.contains.withArgs(outsideElement).returns(false);

					pa11y.runners['mock-runner'].returns([
						{
							code: 'mock-code-1',
							context: '<element>mock-html</element>',
							element: insideElement,
							message: 'mock issue 1',
							selector: '#mock-inside-element',
							type: 'error'
						},
						{
							code: 'mock-code-2',
							context: '<element>mock-html</element>',
							element: outsideElement,
							message: 'mock issue 2',
							selector: '#mock-outside-element',
							type: 'error'
						}
					]);
					options.rootElement = '#root-element';
					resolvedValue = await pa11y.run(options);
				});

				it('selects the root element', () => {
					assert.calledWithExactly(window.document.querySelector, '#root-element');
				});

				it('does not resolve with issues outside of the root element', () => {
					assert.deepEqual(resolvedValue.issues, [
						{
							code: 'mock-code-1',
							context: '<element>mock-html</element>',
							message: 'mock issue 1',
							selector: '#mock-inside-element',
							runner: 'mock-runner',
							runnerExtras: {},
							type: 'error',
							typeCode: 1
						}
					]);
				});

				describe('when `options.rootElement` cannot be found in the DOM', () => {

					beforeEach(async () => {
						global.window.document.querySelector.withArgs('#root-element').returns(null);
						resolvedValue = await pa11y.run(options);
					});

					it('resolves with all issues', () => {
						assert.deepEqual(resolvedValue.issues, [
							{
								code: 'mock-code-1',
								context: '<element>mock-html</element>',
								message: 'mock issue 1',
								selector: '#mock-inside-element',
								runner: 'mock-runner',
								runnerExtras: {},
								type: 'error',
								typeCode: 1
							},
							{
								code: 'mock-code-2',
								context: '<element>mock-html</element>',
								message: 'mock issue 2',
								selector: '#mock-outside-element',
								runner: 'mock-runner',
								runnerExtras: {},
								type: 'error',
								typeCode: 1
							}
						]);
					});

				});

			});

			describe('when `options.hideElements` is set', () => {
				let childOfHiddenElement;
				let hiddenElement;
				let unhiddenElement;

				beforeEach(async () => {
					hiddenElement = createMockElement({
						id: 'mock-hidden-element'
					});
					childOfHiddenElement = createMockElement({
						id: 'mock-child-of-hidden-element',
						parentNode: hiddenElement
					});
					unhiddenElement = createMockElement({
						id: 'mock-unhidden-element'
					});
					hiddenElement.contains.withArgs(hiddenElement).returns(true);
					hiddenElement.contains.withArgs(childOfHiddenElement).returns(true);

					global.window.document.querySelectorAll.withArgs('hidden1, hidden2').returns([
						hiddenElement
					]);

					pa11y.runners['mock-runner'].returns([
						{
							code: 'mock-code-1',
							element: unhiddenElement,
							message: 'mock issue 1',
							type: 'error'
						},
						{
							code: 'mock-code-2',
							element: hiddenElement,
							message: 'mock issue 2',
							type: 'error'
						},
						{
							code: 'mock-code-3',
							element: childOfHiddenElement,
							message: 'mock issue 3',
							type: 'error'
						}
					]);
					options.hideElements = 'hidden1, hidden2';
					resolvedValue = await pa11y.run(options);
				});

				it('selects the hidden elements', () => {
					assert.calledWithExactly(window.document.querySelectorAll, options.hideElements);
				});

				it('does not resolve with issues inside hidden elements, or that are hidden themselves', () => {
					assert.deepEqual(resolvedValue.issues, [
						{
							code: 'mock-code-1',
							context: '<element>mock-html</element>',
							message: 'mock issue 1',
							selector: '#mock-unhidden-element',
							runner: 'mock-runner',
							runnerExtras: {},
							type: 'error',
							typeCode: 1
						}
					]);
				});

			});

			describe('when an issue does not have an element property', () => {

				beforeEach(async () => {
					pa11y.runners['mock-runner'].returns([
						{
							code: 'mock-code-1',
							element: null,
							message: 'mock issue 1',
							type: 'error'
						}
					]);
					resolvedValue = await pa11y.run(options);
				});

				it('defaults context and selector to empty strings', () => {
					assert.deepEqual(resolvedValue.issues, [
						{
							code: 'mock-code-1',
							context: '',
							message: 'mock issue 1',
							selector: '',
							runner: 'mock-runner',
							runnerExtras: {},
							type: 'error',
							typeCode: 1
						}
					]);
				});

			});

		});

		describe('.getElementContext(element)', () => {
			let returnValue;

			describe('when the element HTML is short enough to not need truncating', () => {

				beforeEach(() => {
					const element = createMockElement({
						outerHTML: '<element>mock-html</element>'
					});
					returnValue = pa11y.getElementContext(element);
				});

				it('returns the element HTML unmodified', () => {
					assert.strictEqual(returnValue, '<element>mock-html</element>');
				});

			});

			describe('when the element has a long `innerHTML`', () => {

				beforeEach(() => {
					const element = createMockElement({
						innerHTML: 'mock-html-that-is-longer-than-31-characters',
						outerHTML: '<element>mock-html-that-is-longer-than-31-characters</element>'
					});
					returnValue = pa11y.getElementContext(element);
				});

				it('returns the element HTML with the inner HTML truncated', () => {
					assert.strictEqual(returnValue, '<element>mock-html-that-is-longer-than-3...</element>');
				});

			});

			describe('when the element has a long `outerHTML`', () => {

				beforeEach(() => {
					const element = createMockElement({
						innerHTML: 'mock-html',
						outerHTML: '<element alphabetx10="abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz">mock-html</element>'
					});
					returnValue = pa11y.getElementContext(element);
				});

				it('returns the element HTML with the outer HTML truncated', () => {
					assert.strictEqual(returnValue, '<element alphabetx10="abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrst...');
				});

			});

			describe('when the element `outerHTML` is empty', () => {

				beforeEach(() => {
					const element = createMockElement({
						outerHTML: ''
					});
					returnValue = pa11y.getElementContext(element);
				});

				it('returns null', () => {
					assert.isNull(returnValue);
				});

			});

		});

		describe('.getElementSelector(element)', () => {
			let returnValue;

			describe('when the element has an ID', () => {

				beforeEach(() => {
					const element = createMockElement({
						id: 'mock-id'
					});
					returnValue = pa11y.getElementSelector(element);
				});

				it('returns an `ID` selector', () => {
					assert.strictEqual(returnValue, '#mock-id');
				});

			});

			describe('when the element does not have an ID', () => {

				describe('but it\'s parent node does have an ID', () => {

					beforeEach(() => {
						const parent = createMockElement({
							id: 'mock-parent',
							tagName: 'PARENT'
						});
						const element = createMockElement({
							tagName: 'CHILD',
							parentNode: parent
						});
						returnValue = pa11y.getElementSelector(element);
					});

					it('returns an `ID > TagName` selector', () => {
						assert.strictEqual(returnValue, '#mock-parent > child');
					});

				});

				describe('and none of it\'s parent nodes have IDs', () => {

					beforeEach(() => {
						const parent = createMockElement({
							tagName: 'PARENT'
						});
						const element = createMockElement({
							tagName: 'CHILD',
							parentNode: parent
						});
						returnValue = pa11y.getElementSelector(element);
					});

					it('returns a `TagName > TagName` selector', () => {
						assert.strictEqual(returnValue, 'parent > child');
					});

				});

				describe('and it has siblings of the same type', () => {

					beforeEach(() => {
						const parent = createMockElement({
							tagName: 'PARENT'
						});
						createMockElement({
							id: 'sibling-1',
							tagName: 'CHILD',
							parentNode: parent
						});
						const element = createMockElement({
							tagName: 'CHILD',
							parentNode: parent
						});
						createMockElement({
							id: 'sibling-2',
							tagName: 'CHILD',
							parentNode: parent
						});
						returnValue = pa11y.getElementSelector(element);
					});

					it('returns a `TagName > TagName:nth-child` selector', () => {
						assert.strictEqual(returnValue, 'parent > child:nth-child(2)');
					});

				});

				describe('and it is not an element node', () => {

					beforeEach(() => {
						const element = createMockElement({
							tagName: 'CHILD',
							nodeType: 7
						});
						returnValue = pa11y.getElementSelector(element);
					});

					it('returns an empty selector', () => {
						assert.strictEqual(returnValue, '');
					});

				});

			});

		});

	});

});

'use strict';

const assert = require('proclaim');
const {createMockElement} = require('../mock/element.mock');
const sinon = require('sinon');

describe('lib/runner', function() {
	let pa11y;
	let runner;

	beforeEach(function() {
		runner = require('../../../lib/runner');
		/* eslint-disable no-underscore-dangle */
		pa11y = runner.__pa11y;
		/* eslint-enable no-underscore-dangle */
	});

	it('is an object', function() {
		assert.isObject(runner);
	});

	describe('.__pa11y', function() {
		let originalWindow;

		beforeEach(function() {
			originalWindow = global.window;
			global.window = require('../mock/window.mock');
		});

		afterEach(function() {
			global.window = originalWindow;
		});

		it('is an object', function() {
			assert.isObject(pa11y);
		});

		describe('.run(options)', function() {
			let options;
			let resolvedValue;
			let mockIssues;

			beforeEach(async function() {
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

			it('sets `__pa11y.version` to the `pa11yVersion` option', function() {
				assert.strictEqual(pa11y.version, '1.2.3');
			});

			it('runs all of the specified runners with the options and runner', function() {
				assert.calledOnce(pa11y.runners['mock-runner']);
				assert.calledWithExactly(pa11y.runners['mock-runner'], options, pa11y);
			});

			it('resolves with page details and an array of issues', function() {
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

			describe('when the document title is not set', function() {

				beforeEach(async function() {
					delete window.document.title;
					pa11y.runners['mock-runner'].returns([]);
					resolvedValue = await pa11y.run(options);
				});

				it('resolves with an empty `documentTitle` property', function() {
					assert.strictEqual(resolvedValue.documentTitle, '');
				});

			});

			describe('when the location href is not set', function() {

				beforeEach(async function() {
					delete window.location.href;
					pa11y.runners['mock-runner'].returns([]);
					resolvedValue = await pa11y.run(options);
				});

				it('resolves with an empty `pageUrl` property', function() {
					assert.strictEqual(resolvedValue.pageUrl, '');
				});

			});

			describe('when an issue type is not found', function() {

				beforeEach(async function() {
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

				it('resolves with a `typeCode` of 0', function() {
					assert.strictEqual(resolvedValue.issues[0].typeCode, 0);
				});

			});

			describe('when the runner errors', function() {
				let rejectedError;
				let runnerError;

				beforeEach(async function() {
					runnerError = new Error('HTML CodeSniffer error');
					pa11y.runners['mock-runner'].rejects(runnerError);
					try {
						await pa11y.run(options);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with that error', function() {
					assert.strictEqual(rejectedError, runnerError);
				});

			});

			describe('when `options.ignore` includes an issue type', function() {

				beforeEach(async function() {
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

				it('does not resolve with issues of that type', function() {
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

			describe('when `options.ignore` includes an issue code', function() {

				beforeEach(async function() {
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

				it('does not resolve with issues with that code', function() {
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

				describe('when the issue code case does not match', function() {

					beforeEach(async function() {
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

					it('still does not resolve with issues with that code', function() {
						assert.deepEqual(resolvedValue.issues, []);
					});

				});

			});

			describe('when `options.rootElement` is set', function() {
				let insideElement;
				let outsideElement;
				let rootElement;

				beforeEach(async function() {
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

				it('selects the root element', function() {
					assert.calledWithExactly(window.document.querySelector, '#root-element');
				});

				it('does not resolve with issues outside of the root element', function() {
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

				describe('when `options.rootElement` cannot be found in the DOM', function() {

					beforeEach(async function() {
						global.window.document.querySelector.withArgs('#root-element').returns(null);
						resolvedValue = await pa11y.run(options);
					});

					it('resolves with all issues', function() {
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

			describe('when `options.hideElements` is set', function() {
				let childOfHiddenElement;
				let hiddenElement;
				let unhiddenElement;

				beforeEach(async function() {
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

				it('selects the hidden elements', function() {
					assert.calledWithExactly(window.document.querySelectorAll, options.hideElements);
				});

				it('does not resolve with issues inside hidden elements, or that are hidden themselves', function() {
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

			describe('when an issue does not have an element property', function() {

				beforeEach(async function() {
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

				it('defaults context and selector to empty strings', function() {
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

		describe('.getElementContext(element)', function() {
			let returnValue;

			describe('when the element HTML is short enough to not need truncating', function() {

				beforeEach(function() {
					const element = createMockElement({
						outerHTML: '<element>mock-html</element>'
					});
					returnValue = pa11y.getElementContext(element);
				});

				it('returns the element HTML unmodified', function() {
					assert.strictEqual(returnValue, '<element>mock-html</element>');
				});

			});

			describe('when the element has a long `innerHTML`', function() {

				beforeEach(function() {
					const element = createMockElement({
						innerHTML: 'mock-html-that-is-longer-than-31-characters',
						outerHTML: '<element>mock-html-that-is-longer-than-31-characters</element>'
					});
					returnValue = pa11y.getElementContext(element);
				});

				it('returns the element HTML with the inner HTML truncated', function() {
					assert.strictEqual(returnValue, '<element>mock-html-that-is-longer-than-3...</element>');
				});

			});

			describe('when the element has a long `outerHTML`', function() {

				beforeEach(function() {
					const element = createMockElement({
						innerHTML: 'mock-html',
						outerHTML: '<element alphabetx10="abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz">mock-html</element>'
					});
					returnValue = pa11y.getElementContext(element);
				});

				it('returns the element HTML with the outer HTML truncated', function() {
					assert.strictEqual(returnValue, '<element alphabetx10="abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrst...');
				});

			});

			describe('when the element `outerHTML` is empty', function() {

				beforeEach(function() {
					const element = createMockElement({
						outerHTML: ''
					});
					returnValue = pa11y.getElementContext(element);
				});

				it('returns null', function() {
					assert.isNull(returnValue);
				});

			});

		});

		describe('.getElementSelector(element)', function() {
			let returnValue;

			describe('when the element has an ID', function() {

				beforeEach(function() {
					const element = createMockElement({
						id: 'mock-id'
					});
					returnValue = pa11y.getElementSelector(element);
				});

				it('returns an `ID` selector', function() {
					assert.strictEqual(returnValue, '#mock-id');
				});

			});

			describe('when the element does not have an ID', function() {

				describe('but it\'s parent node does have an ID', function() {

					beforeEach(function() {
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

					it('returns an `ID > TagName` selector', function() {
						assert.strictEqual(returnValue, '#mock-parent > child');
					});

				});

				describe('and none of it\'s parent nodes have IDs', function() {

					beforeEach(function() {
						const parent = createMockElement({
							tagName: 'PARENT'
						});
						const element = createMockElement({
							tagName: 'CHILD',
							parentNode: parent
						});
						returnValue = pa11y.getElementSelector(element);
					});

					it('returns a `TagName > TagName` selector', function() {
						assert.strictEqual(returnValue, 'parent > child');
					});

				});

				describe('and it has siblings of the same type', function() {

					beforeEach(function() {
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

					it('returns a `TagName > TagName:nth-child` selector', function() {
						assert.strictEqual(returnValue, 'parent > child:nth-child(2)');
					});

				});

				describe('and it is not an element node', function() {

					beforeEach(function() {
						const element = createMockElement({
							tagName: 'CHILD',
							nodeType: 7
						});
						returnValue = pa11y.getElementSelector(element);
					});

					it('returns an empty selector', function() {
						assert.strictEqual(returnValue, '');
					});

				});

			});

		});

	});

});

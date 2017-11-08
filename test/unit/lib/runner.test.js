'use strict';

const assert = require('proclaim');
const createMockElement = require('../mock/element.mock');

describe('lib/runner', () => {
	let runner;
	let runPa11y;

	beforeEach(() => {
		runner = require('../../../lib/runner');
		/* eslint-disable no-underscore-dangle */
		runPa11y = runner._runPa11y;
		/* eslint-enable no-underscore-dangle */
	});

	it('should be an object', () => {
		assert.isObject(runner);
	});

	it('have a `_runPa11y` method', () => {
		assert.isFunction(runPa11y);
	});

	describe('._runPa11y(options)', () => {
		let options;
		let originalWindow;
		let resolvedValue;

		beforeEach(async () => {
			originalWindow = global.window;
			global.window = require('../mock/window.mock');
			global.window.HTMLCS.getMessages.returns([
				{
					code: 'mock-code',
					element: createMockElement({
						id: 'mock-element'
					}),
					msg: 'mock issue',
					type: 1
				}
			]);
			options = {
				ignore: [],
				rootElement: null,
				rules: [],
				standard: 'mock-standard',
				wait: 0
			};
			resolvedValue = await runPa11y(options);
		});

		afterEach(() => {
			global.window = originalWindow;
		});

		it('runs HTML CodeSniffer', () => {
			assert.calledOnce(global.window.HTMLCS.process);
			assert.calledWith(global.window.HTMLCS.process, options.standard, window.document);
			assert.isFunction(global.window.HTMLCS.process.firstCall.args[2]);
		});

		it('gets HTML CodeSniffer issues', () => {
			assert.calledOnce(global.window.HTMLCS.getMessages);
			assert.calledWithExactly(global.window.HTMLCS.getMessages);
		});

		it('resolves with page details and an array of processed HTML CodeSniffer issues', () => {
			assert.isObject(resolvedValue);
			assert.strictEqual(resolvedValue.documentTitle, window.document.title);
			assert.strictEqual(resolvedValue.pageUrl, window.location.href);
			assert.isArray(resolvedValue.issues);
			assert.deepEqual(resolvedValue.issues, [
				{
					code: 'mock-code',
					context: '<element>mock-html</element>',
					message: 'mock issue',
					selector: '#mock-element',
					type: 'error',
					typeCode: 1
				}
			]);
		});

		describe('when the document title is not set', () => {

			beforeEach(async () => {
				delete window.document.title;
				global.window.HTMLCS.getMessages.returns([]);
				resolvedValue = await runPa11y(options);
			});

			it('resolves with an empty `documentTitle` property', () => {
				assert.strictEqual(resolvedValue.documentTitle, '');
			});

		});

		describe('when the location href is not set', () => {

			beforeEach(async () => {
				delete window.location.href;
				global.window.HTMLCS.getMessages.returns([]);
				resolvedValue = await runPa11y(options);
			});

			it('resolves with an empty `pageUrl` property', () => {
				assert.strictEqual(resolvedValue.pageUrl, '');
			});

		});

		describe('when an issue type code is not found', () => {

			beforeEach(async () => {
				global.window.HTMLCS.getMessages.returns([
					{
						code: 'mock-code',
						element: createMockElement({
							id: 'mock-element'
						}),
						msg: 'mock issue',
						type: 7
					}
				]);
				resolvedValue = await runPa11y(options);
			});

			it('resolves with a `type` of "unknown"', () => {
				assert.strictEqual(resolvedValue.issues[0].type, 'unknown');
			});

		});

		describe('when an issue element has no `outerHTML`', () => {

			beforeEach(async () => {
				global.window.HTMLCS.getMessages.returns([
					{
						code: 'mock-code',
						element: createMockElement({
							id: 'mock-element',
							outerHTML: ''
						}),
						msg: 'mock issue',
						type: 1
					}
				]);
				resolvedValue = await runPa11y(options);
			});

			it('resolves with a `context` of `null`', () => {
				assert.isNull(resolvedValue.issues[0].context);
			});

		});

		describe('when an issue element has a long `innerHTML`', () => {

			beforeEach(async () => {
				global.window.HTMLCS.getMessages.returns([
					{
						code: 'mock-code',
						element: createMockElement({
							id: 'mock-element',
							innerHTML: 'mock-html-that-is-longer-than-31-characters',
							outerHTML: '<element>mock-html-that-is-longer-than-31-characters</element>'
						}),
						msg: 'mock issue',
						type: 1
					}
				]);
				resolvedValue = await runPa11y(options);
			});

			it('resolves with a `context` that has truncated `innerHTML`', () => {
				assert.strictEqual(resolvedValue.issues[0].context, '<element>mock-html-that-is-longer-than-3...</element>');
			});

		});

		describe('when an issue element has a long `outerHTML`', () => {

			beforeEach(async () => {
				global.window.HTMLCS.getMessages.returns([
					{
						code: 'mock-code',
						element: createMockElement({
							id: 'mock-element',
							outerHTML: '<element alphabetx10="abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz">mock-html</element>'
						}),
						msg: 'mock issue',
						type: 1
					}
				]);
				resolvedValue = await runPa11y(options);
			});

			it('resolves with a `context` that has truncated `innerHTML`', () => {
				assert.strictEqual(resolvedValue.issues[0].context, '<element alphabetx10="abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrst...');
			});

		});

		describe('when an issue element does not have an ID', () => {

			describe('but it\'s parent node does have an ID', () => {

				beforeEach(async () => {
					const parent = createMockElement({
						id: 'mock-parent',
						tagName: 'PARENT'
					});
					const child = createMockElement({
						tagName: 'CHILD',
						parentNode: parent
					});
					global.window.HTMLCS.getMessages.returns([
						{
							code: 'mock-code',
							element: child,
							msg: 'mock issue',
							type: 1
						}
					]);
					resolvedValue = await runPa11y(options);
				});

				it('resolves with a `selector` that includes the parent ID and child tagname', () => {
					assert.strictEqual(resolvedValue.issues[0].selector, '#mock-parent > child');
				});

			});

			describe('and none of it\'s parent nodes have IDs', () => {

				beforeEach(async () => {
					const parent = createMockElement({
						tagName: 'PARENT'
					});
					const child = createMockElement({
						tagName: 'CHILD',
						parentNode: parent
					});
					global.window.HTMLCS.getMessages.returns([
						{
							code: 'mock-code',
							element: child,
							msg: 'mock issue',
							type: 1
						}
					]);
					resolvedValue = await runPa11y(options);
				});

				it('resolves with a `selector` that includes the parent and child tagnames', () => {
					assert.strictEqual(resolvedValue.issues[0].selector, 'parent > child');
				});

			});

			describe('and it has siblings of the same type', () => {

				beforeEach(async () => {
					const parent = createMockElement({
						tagName: 'PARENT'
					});
					createMockElement({
						id: 'sibling-1',
						tagName: 'CHILD',
						parentNode: parent
					});
					const child = createMockElement({
						tagName: 'CHILD',
						parentNode: parent
					});
					createMockElement({
						id: 'sibling-2',
						tagName: 'CHILD',
						parentNode: parent
					});
					global.window.HTMLCS.getMessages.returns([
						{
							code: 'mock-code',
							element: child,
							msg: 'mock issue',
							type: 1
						}
					]);
					resolvedValue = await runPa11y(options);
				});

				it('resolves with a `selector` that includes an `nth-child` pseudo-class', () => {
					assert.strictEqual(resolvedValue.issues[0].selector, 'parent > child:nth-child(2)');
				});

			});

			describe('and it is not an element node', () => {

				beforeEach(async () => {
					const child = createMockElement({
						tagName: 'CHILD',
						nodeType: 7
					});
					global.window.HTMLCS.getMessages.returns([
						{
							code: 'mock-code',
							element: child,
							msg: 'mock issue',
							type: 1
						}
					]);
					resolvedValue = await runPa11y(options);
				});

				it('resolves with an empty `selector`', () => {
					assert.strictEqual(resolvedValue.issues[0].selector, '');
				});

			});

		});

		describe('when HTML CodeSniffer errors', () => {
			let htmlCodeSnifferError;
			let rejectedError;

			beforeEach(async () => {
				htmlCodeSnifferError = new Error('HTML CodeSniffer error');
				window.HTMLCS.process.yieldsAsync(htmlCodeSnifferError);
				try {
					await runPa11y(options);
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with that error', () => {
				assert.strictEqual(rejectedError, htmlCodeSnifferError);
			});

		});

		describe('when `options.ignore` includes an issue type', () => {

			beforeEach(async () => {
				global.window.HTMLCS.getMessages.returns([
					{
						code: 'mock-error',
						element: createMockElement({
							id: 'mock-element'
						}),
						msg: 'mock issue',
						type: 1
					},
					{
						code: 'mock-warning',
						element: createMockElement({
							id: 'mock-element'
						}),
						msg: 'mock issue',
						type: 2
					}
				]);
				options.ignore = [
					'error'
				];
				resolvedValue = await runPa11y(options);
			});

			it('does not resolve with issues of that type', () => {
				assert.deepEqual(resolvedValue.issues, [
					{
						code: 'mock-warning',
						context: '<element>mock-html</element>',
						message: 'mock issue',
						selector: '#mock-element',
						type: 'warning',
						typeCode: 2
					}
				]);
			});

		});

		describe('when `options.ignore` includes an issue code', () => {

			beforeEach(async () => {
				global.window.HTMLCS.getMessages.returns([
					{
						code: 'mock-code-1',
						element: createMockElement({
							id: 'mock-element'
						}),
						msg: 'mock issue',
						type: 1
					},
					{
						code: 'mock-code-2',
						element: createMockElement({
							id: 'mock-element'
						}),
						msg: 'mock issue',
						type: 1
					}
				]);
				options.ignore = [
					'mock-code-1'
				];
				resolvedValue = await runPa11y(options);
			});

			it('does not resolve with issues with that code', () => {
				assert.deepEqual(resolvedValue.issues, [
					{
						code: 'mock-code-2',
						context: '<element>mock-html</element>',
						message: 'mock issue',
						selector: '#mock-element',
						type: 'error',
						typeCode: 1
					}
				]);
			});

			describe('when the issue code case does not match', () => {

				beforeEach(async () => {
					global.window.HTMLCS.getMessages.returns([
						{
							code: 'MOCK-CODE',
							element: createMockElement({
								id: 'mock-element'
							}),
							msg: 'mock issue',
							type: 1
						}
					]);
					options.ignore = [
						'mock-code'
					];
					resolvedValue = await runPa11y(options);
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

				global.window.HTMLCS.getMessages.returns([
					{
						code: 'mock-code-1',
						element: insideElement,
						msg: 'mock issue',
						type: 1
					},
					{
						code: 'mock-code-2',
						element: outsideElement,
						msg: 'mock issue',
						type: 1
					}
				]);
				options.rootElement = '#root-element';
				resolvedValue = await runPa11y(options);
			});

			it('selects the root element', () => {
				assert.calledWithExactly(window.document.querySelector, '#root-element');
			});

			it('does not resolve with issues outside of the root element', () => {
				assert.deepEqual(resolvedValue.issues, [
					{
						code: 'mock-code-1',
						context: '<element>mock-html</element>',
						message: 'mock issue',
						selector: '#mock-inside-element',
						type: 'error',
						typeCode: 1
					}
				]);
			});

			describe('when `options.rootElement` cannot be found in the DOM', () => {

				beforeEach(async () => {
					global.window.document.querySelector.withArgs('#root-element').returns(null);
					resolvedValue = await runPa11y(options);
				});

				it('resolves with all issues', () => {
					assert.deepEqual(resolvedValue.issues, [
						{
							code: 'mock-code-1',
							context: '<element>mock-html</element>',
							message: 'mock issue',
							selector: '#mock-inside-element',
							type: 'error',
							typeCode: 1
						},
						{
							code: 'mock-code-2',
							context: '<element>mock-html</element>',
							message: 'mock issue',
							selector: '#mock-outside-element',
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

				global.window.HTMLCS.getMessages.returns([
					{
						code: 'mock-code-1',
						element: unhiddenElement,
						msg: 'mock issue',
						type: 1
					},
					{
						code: 'mock-code-2',
						element: hiddenElement,
						msg: 'mock issue',
						type: 1
					},
					{
						code: 'mock-code-3',
						element: childOfHiddenElement,
						msg: 'mock issue',
						type: 1
					}
				]);
				options.hideElements = 'hidden1, hidden2';
				resolvedValue = await runPa11y(options);
			});

			it('selects the hidden elements', () => {
				assert.calledWithExactly(window.document.querySelectorAll, options.hideElements);
			});

			it('does not resolve with issues inside hidden elements, or that are hidden themselves', () => {
				assert.deepEqual(resolvedValue.issues, [
					{
						code: 'mock-code-1',
						context: '<element>mock-html</element>',
						message: 'mock issue',
						selector: '#mock-unhidden-element',
						type: 'error',
						typeCode: 1
					}
				]);
			});

		});

		describe('when `options.rules` is set', () => {

			beforeEach(async () => {
				options.rules = [
					'mock-sniff-1',
					'mock-sniff-2'
				];
				resolvedValue = await runPa11y(options);
			});

			it('adds the rules to the current standard', () => {
				assert.deepEqual(window['HTMLCS_mock-standard'].sniffs[0].include, [
					'mock-sniff-1',
					'mock-sniff-2'
				]);
			});

			describe('When `options.standard` is set to "Section508"', () => {

				beforeEach(async () => {
					options.standard = 'Section508';
					resolvedValue = await runPa11y(options);
				});

				it('does not add the rules to the current standard', () => {
					assert.deepEqual(window.HTMLCS_Section508.sniffs[0].include, []);
				});

			});

			describe('When `options.standard` is set to "Section508"', () => {
				let rejectedError;

				beforeEach(async () => {
					options.rules = [
						'mock-sniff-nonexistent'
					];
					try {
						await runPa11y(options);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with a descriptive error', () => {
					assert.instanceOf(rejectedError, Error);
					assert.strictEqual(rejectedError.message, 'mock-sniff-nonexistent is not a valid WCAG 2.0 rule');
				});

			});

		});

	});

});

'use strict';

const assert = require('proclaim');
const sinon = require('sinon');

describe('lib/runner', () => {
	let issues;
	let originalWindow;
	let runner;

	beforeEach(() => {

		issues = [
			{
				code: 'mock-code-1',
				msg: 'mock message 1',
				type: 1,
				element: 'mock-element-1'
			},
			{
				code: 'mock-code-2',
				msg: 'mock message 2',
				type: 2,
				element: 'mock-element-2'
			},
			{
				code: 'mock-code-3',
				msg: 'mock message 3',
				type: 3,
				element: 'mock-element-3'
			},
			{
				code: 'mock-code-4',
				msg: 'mock message 4',
				type: 4,
				element: 'mock-element-4'
			}
		];

		originalWindow = global.window;
		global.window = {
			document: 'mock-document',
			HTMLCS: {
				process: sinon.stub().yieldsAsync(),
				getMessages: sinon.stub().returns(issues)
			}
		};

		runner = require('../../../lib/runner');
	});

	afterEach(() => {
		global.window = originalWindow;
	});

	it('is an object', () => {
		assert.isObject(runner);
	});

	it('has a `supports` property set to a string', () => {
		assert.isString(runner.supports);
	});

	it('has a `scripts` property set to an array of scripts the runner is dependent on', () => {
		assert.isArray(runner.scripts);
		assert.lengthEquals(runner.scripts, 1);
		assert.isTrue(runner.scripts[0].endsWith('node_modules/html_codesniffer/build/HTMLCS.js'));
	});

	it('has a `run` method', () => {
		assert.isFunction(runner.run);
	});

	describe('.run(options, pa11y)', () => {
		let options;
		let pa11y;
		let resolvedValue;

		beforeEach(async () => {
			options = {
				rules: [],
				standard: 'mock-standard'
			};
			pa11y = {};
			resolvedValue = await runner.run(options, pa11y);
		});

		it('runs HTML CodeSniffer', () => {
			assert.calledOnce(global.window.HTMLCS.process);
			assert.calledWith(
				global.window.HTMLCS.process,
				'mock-standard',
				global.window.document
			);
		});

		it('gets HTML CodeSniffer messages', () => {
			assert.calledOnce(global.window.HTMLCS.getMessages);
			assert.calledWithExactly(global.window.HTMLCS.getMessages);
		});

		it('resolves with processed and normalised issues', () => {
			assert.deepEqual(resolvedValue, [
				{
					code: 'mock-code-1',
					message: 'mock message 1',
					type: 'error',
					element: 'mock-element-1'
				},
				{
					code: 'mock-code-2',
					message: 'mock message 2',
					type: 'warning',
					element: 'mock-element-2'
				},
				{
					code: 'mock-code-3',
					message: 'mock message 3',
					type: 'notice',
					element: 'mock-element-3'
				},
				{
					code: 'mock-code-4',
					message: 'mock message 4',
					type: 'unknown',
					element: 'mock-element-4'
				}
			]);
		});

		describe('when HTML CodeSniffer errors', () => {
			let htmlcsError;
			let rejectedError;

			beforeEach(async () => {
				htmlcsError = new Error('htmlcs error');
				window.HTMLCS.process.reset();
				window.HTMLCS.process.yieldsAsync(htmlcsError);
				window.HTMLCS.getMessages.reset();
				try {
					await runner.run(options, pa11y);
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with the HTML CodeSniffer error', () => {
				assert.strictEqual(rejectedError, htmlcsError);
			});

			it('does not get HTML CodeSniffer messages', () => {
				assert.notCalled(window.HTMLCS.getMessages);
			});

		});

		describe('when the rules option is set', () => {

			beforeEach(async () => {
				global.window['HTMLCS_mock-standard'] = {
					sniffs: [
						{
							include: [
								'mock-rule-1'
							]
						}
					]
				};
				global.window.HTMLCS_WCAG2AAA = {
					sniffs: [
						'mock-rule-1',
						'mock-rule-2',
						'mock-rule-3',
						'mock-rule-4'
					]
				};
				options.rules = [
					'mock-rule-2',
					'mock-rule-3'
				];
				resolvedValue = await runner.run(options, pa11y);
			});

			it('adds the specified rules to the standard', () => {
				assert.deepEqual(global.window['HTMLCS_mock-standard'].sniffs[0].include, [
					'mock-rule-1',
					'mock-rule-2',
					'mock-rule-3'
				]);
			});

			describe('and one of the rules does not exist', () => {
				let rejectedError;

				beforeEach(async () => {
					options.rules = [
						'mock-rule-5'
					];
					try {
						await runner.run(options, pa11y);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with an error', () => {
					assert.instanceOf(rejectedError, Error);
					assert.strictEqual(
						rejectedError.message,
						'mock-rule-5 is not a valid WCAG 2.0 rule'
					);
				});

			});

		});

		describe('when the site is using AMD', () => {
			let htmlcsModule;

			beforeEach(async () => {
				htmlcsModule = {
					HTMLCS: {
						process: sinon.stub().yieldsAsync(),
						getMessages: sinon.stub().returns(issues)
					}
				};
				// eslint-disable-next-line no-empty-function
				global.window.define = () => {};
				global.window.define.amd = true;
				global.window.require = sinon.stub().callsFake((dependency, callback) => {
					callback(htmlcsModule);
				});

				await runner.run(options, pa11y);
			});

			it('calls require', () => {
				assert.calledOnce(global.window.require);
				assert.calledOnce(htmlcsModule.HTMLCS.process);
				sinon.assert.calledWith(
					global.window.require,
					sinon.match.array.deepEquals(['htmlcs']),
					sinon.match.typeOf('function')
				);
				assert.calledWith(
					htmlcsModule.HTMLCS.process,
					'mock-standard',
					global.window.document
				);
			});
		});

	});

});

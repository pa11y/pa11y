'use strict';

const path = require('path');
const runner = require('../../../../lib/runners/htmlcs');

describe('lib/runners/htmlcs', () => {
	let issues;
	let originalWindow;

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
				process: jest.fn(),
				getMessages: jest.fn().mockReturnValue(issues)
			}
		};
	});

	afterEach(() => {
		global.window = originalWindow;
	});

	it('is an object', () => {
		expect(typeof runner).toBe('object');
	});

	it('has a `supports` property set to a string', () => {
		expect(runner.supports).toEqual(expect.any(String));
	});

	it('has a `scripts` property set to an array of scripts the runner is dependent on', () => {
		expect(runner.scripts).toHaveLength(1);
		expect(
			runner.scripts[0].endsWith(
				path.join('node_modules', 'html_codesniffer', 'build', 'HTMLCS.js')
			)
		).toEqual(true);
	});

	it('has a `run` method', () => {
		expect(runner.run).toEqual(expect.any(Function));
	});

	describe('.run(options, pa11y)', () => {
		let options;
		let pa11y;

		beforeEach(() => {
			options = {
				rules: [],
				standard: 'mock-standard'
			};
			pa11y = {};
		});

		describe('without error', () => {
			let resolvedValue;

			beforeEach(async () => {
				window.HTMLCS.process.mockImplementationOnce((_, __, callback) => callback());
				resolvedValue = await runner.run(options, pa11y);
			});

			it('runs HTML CodeSniffer', () => {
				expect(global.window.HTMLCS.process).toHaveBeenCalledTimes(1);
				expect(global.window.HTMLCS.process).toHaveBeenCalledWith(
					'mock-standard',
					global.window.document,
					expect.any(Function)
				);
			});

			it('gets HTML CodeSniffer messages', () => {
				expect(global.window.HTMLCS.getMessages).toHaveBeenCalledTimes(1);
				expect(global.window.HTMLCS.getMessages).toHaveBeenCalledWith();
			});

			it('resolves with processed and normalised issues', () => {
				expect(resolvedValue).toEqual([
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
		});

		describe('when HTML CodeSniffer errors', () => {
			let htmlcsError;
			let rejectedError;

			beforeEach(async () => {
				htmlcsError = new Error('htmlcs error');
				window.HTMLCS.process.mockImplementationOnce((_, __, callback) => callback(htmlcsError));
				try {
					await runner.run(options, pa11y);
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with the HTML CodeSniffer error', () => {
				expect(rejectedError).toEqual(htmlcsError);
			});

			it('does not get HTML CodeSniffer messages', () => {
				expect(window.HTMLCS.getMessages).not.toHaveBeenCalled();
			});
		});

		describe('when the rules option is set', () => {
			beforeEach(async () => {
				global.window['HTMLCS_mock-standard'] = {
					sniffs: [
						{
							include: ['mock-rule-1']
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
				options.rules = ['mock-rule-2', 'mock-rule-3'];
				window.HTMLCS.process.mockImplementationOnce((_, __, callback) => callback());
				await runner.run(options, pa11y);
			});

			it('adds the specified rules to the standard', () => {
				expect(
					global.window['HTMLCS_mock-standard'].sniffs[0].include
				).toEqual(['mock-rule-1', 'mock-rule-2', 'mock-rule-3']);
			});

			describe('and one of the rules does not exist', () => {
				let rejectedError;

				beforeEach(async () => {
					options.rules = ['mock-rule-5'];
					try {
						await runner.run(options, pa11y);
					} catch (error) {
						rejectedError = error;
					}
				});

				it('rejects with an error', () => {
					expect(rejectedError).toEqual(expect.any(Error));
					expect(rejectedError.message).toEqual(
						'mock-rule-5 is not a valid WCAG 2.1 rule'
					);
				});
			});
		});

		describe('when the site is using AMD', () => {
			let htmlcsModule;

			beforeEach(async () => {
				htmlcsModule = {
					HTMLCS: {
						process: jest.fn().mockImplementationOnce((_, __, callback) => callback()),
						getMessages: jest.fn().mockReturnValue(issues)
					}
				};
				// eslint-disable-next-line no-empty-function
				global.window.define = () => {};
				global.window.define.amd = true;
				global.window.require = jest.fn((dependency, callback) => {
					callback(htmlcsModule);
				});

				await runner.run(options, pa11y);
			});

			it('calls require', () => {
				expect(global.window.require).toHaveBeenCalledTimes(1);
				expect(htmlcsModule.HTMLCS.process).toHaveBeenCalledTimes(1);
				expect(global.window.require).toHaveBeenCalledWith(
					['htmlcs'],
					expect.any(Function)
				);
				expect(htmlcsModule.HTMLCS.process).toHaveBeenCalledWith(
					'mock-standard',
					global.window.document,
					expect.any(Function)
				);
			});
		});
	});
});

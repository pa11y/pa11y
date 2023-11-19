'use strict';

const path = require('path');
const runner = require('../../../../lib/runners/axe');

describe('lib/runners/axe', () => {
	let result;
	let originalWindow;

	beforeEach(() => {
		result = {
			violations: [
				{
					id: 'mock-id-1',
					description: 'mock description 1',
					impact: 'critical',
					help: 'mock help 1',
					helpUrl: 'mock-help-url-1',
					nodes: [
						{
							target: ['mock-selector-1a']
						},
						{
							target: ['mock-selector-1b']
						}
					]
				},
				{
					id: 'mock-id-2',
					description: 'mock description 2',
					impact: 'serious',
					help: 'mock help 2',
					helpUrl: 'mock-help-url-2',
					nodes: [
						{
							target: ['mock-selector-2']
						}
					]
				},
				{
					id: 'mock-id-no-nodes',
					description: 'mock description no-nodes',
					impact: 'moderate',
					help: 'mock help no-nodes',
					helpUrl: 'mock-help-url-no-nodes',
					nodes: []
				}
			],
			incomplete: [
				{
					id: 'mock-id-3',
					description: 'mock description 3',
					impact: 'minor',
					help: 'mock help 3',
					helpUrl: 'mock-help-url-3',
					nodes: [
						{
							target: ['mock-selector-3']
						}
					]
				},
				{
					id: 'mock-id-4',
					description: 'mock description 4',
					impact: 'not a supported impact level',
					help: 'mock help 4',
					helpUrl: 'mock-help-url-4',
					nodes: [
						{
							target: ['iframe-selector-1', 'mock-selector-4a']
						},
						{
							target: ['mock-selector-4b']
						}
					]
				}
			]
		};

		originalWindow = global.window;
		global.window = {
			axe: {
				run: jest.fn().mockResolvedValue(result),
				getRules: jest.fn().mockReturnValue([])
			},
			document: {
				querySelector: jest.fn()
			}
		};

		// eslint-disable-next-line complexity
		global.window.document.querySelector.mockImplementation(selector => {
			switch (selector) {
				case 'mock-selector-1a':
					return 'mock-element-1a';
				case 'mock-selector-1b':
					return 'mock-element-1b';
				case 'mock-selector-2':
					return 'mock-element-2';
				case 'mock-selector-3':
					return 'mock-element-3';
				case 'iframe-selector-1 mock-selector-4a':
					return 'mock-element-4a';
				case 'mock-selector-4b':
					return 'mock-element-4b';
				default:
					return null;
			}
		});
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
		const scriptPath =
			`${path.resolve(__dirname, '..', '..', '..', '..')}` +
			`${path.normalize('/node_modules/axe-core')}/axe.min.js`;
		expect(runner.scripts.length).toBeGreaterThan(0);
		expect(runner.scripts).toEqual([scriptPath]);
	});

	it('has a `run` method', () => {
		expect(runner.run).toEqual(expect.any(Function));
	});

	describe('.run(options, pa11y)', () => {
		let options;
		let pa11y;

		beforeEach(() => {
			options = {};
			pa11y = {};
		});

		describe('with no options', () => {
			let resolvedValue;

			beforeEach(async () => {
				resolvedValue = await runner.run(options, pa11y);
			});

			it('runs axe', () => {
				expect(global.window.axe.run).toHaveBeenCalledTimes(1);
				expect(global.window.axe.run).toHaveBeenCalledWith(
					global.window.document,
					{rules: {}}
				);
			});

			it('resolves with processed and normalised issues', () => {
				expect(resolvedValue).toEqual([
					{
						code: 'mock-id-1',
						message: 'mock help 1 (mock-help-url-1)',
						type: 'error',
						element: 'mock-element-1a',
						runnerExtras: {
							description: 'mock description 1',
							impact: 'critical',
							help: 'mock help 1',
							helpUrl: 'mock-help-url-1'
						}
					},
					{
						code: 'mock-id-1',
						message: 'mock help 1 (mock-help-url-1)',
						type: 'error',
						element: 'mock-element-1b',
						runnerExtras: {
							description: 'mock description 1',
							impact: 'critical',
							help: 'mock help 1',
							helpUrl: 'mock-help-url-1'
						}
					},
					{
						code: 'mock-id-2',
						message: 'mock help 2 (mock-help-url-2)',
						type: 'error',
						element: 'mock-element-2',
						runnerExtras: {
							description: 'mock description 2',
							impact: 'serious',
							help: 'mock help 2',
							helpUrl: 'mock-help-url-2'
						}
					},
					{
						code: 'mock-id-no-nodes',
						message: 'mock help no-nodes (mock-help-url-no-nodes)',
						type: 'warning',
						element: null,
						runnerExtras: {
							description: 'mock description no-nodes',
							impact: 'moderate',
							help: 'mock help no-nodes',
							helpUrl: 'mock-help-url-no-nodes'
						}
					},
					{
						code: 'mock-id-3',
						message: 'mock help 3 (mock-help-url-3)',
						type: 'notice',
						element: 'mock-element-3',
						runnerExtras: {
							description: 'mock description 3',
							impact: 'minor',
							help: 'mock help 3',
							helpUrl: 'mock-help-url-3'
						}
					},
					{
						code: 'mock-id-4',
						message: 'mock help 4 (mock-help-url-4)',
						type: 'error',
						element: 'mock-element-4a',
						runnerExtras: {
							description: 'mock description 4',
							impact: 'not a supported impact level',
							help: 'mock help 4',
							helpUrl: 'mock-help-url-4'
						}
					},
					{
						code: 'mock-id-4',
						message: 'mock help 4 (mock-help-url-4)',
						type: 'error',
						element: 'mock-element-4b',
						runnerExtras: {
							description: 'mock description 4',
							impact: 'not a supported impact level',
							help: 'mock help 4',
							helpUrl: 'mock-help-url-4'
						}
					}
				]);
			});
		});

		describe('when passing the Pa11y option', () => {
			describe('rootElement', () => {
				const cssSelector = '#main';

				beforeEach(async () => {
					options.rootElement = cssSelector;
					await runner.run(options, pa11y);
				});

				it('sets the axe context', () => {
					expect(
						global.window.axe.run).toHaveBeenCalledWith(
						cssSelector,
						expect.anything()
					);
				});
			});

			describe('standard', () => {
				it('supports level A', async () => {
					options.standard = 'WCAG2A';
					await runner.run(options, pa11y);
					expect(
						global.window.axe.run).toHaveBeenCalledWith(
						expect.anything(),
						expect.objectContaining({
							rules: {},
							runOnly: {
								type: 'tags',
								values: ['wcag2a',
									'wcag21a',
									'best-practice']
							}
						})
					);
				});

				it('supports level AA', async () => {
					options.standard = 'WCAG2AA';
					await runner.run(options, pa11y);
					expect(
						global.window.axe.run).toHaveBeenCalledWith(
						expect.anything(),
						expect.objectContaining({
							rules: {},
							runOnly: {
								type: 'tags',
								values: [
									'wcag2a',
									'wcag21a',
									'wcag2aa',
									'wcag21aa',
									'best-practice'
								]
							}
						})
					);
				});
			});

			describe('rules', () => {
				beforeEach(async () => {
					options.rules = [
						'color-contrast',
						'autocomplete-valid',
						'something-else'
					];
					global.window.axe.getRules = jest
						.fn()
						.mockReturnValue([
							{ruleId: 'color-contrast'},
							{ruleId: 'autocomplete-valid'}
						]);
					await runner.run(options, pa11y);
				});

				it('sets the axe rules', () => {
					expect(global.window.axe.run).toHaveBeenCalledWith(
						expect.anything(),
						expect.objectContaining({
							rules: {
								'color-contrast': {enabled: true},
								'autocomplete-valid': {enabled: true}
							}
						})
					);
				});
			});

			describe('ignore', () => {
				beforeEach(async () => {
					options.ignore = [
						'warning',
						'notice',
						'color-contrast',
						'autocomplete-valid'
					];
					global.window.axe.getRules = jest
						.fn()
						.mockReturnValue([
							{ruleId: 'color-contrast'},
							{ruleId: 'autocomplete-valid'}
						]);
					await runner.run(options, pa11y);
				});

				it('sets the axe ignore rules', () => {
					expect(global.window.axe.run).toHaveBeenCalledWith(
						expect.anything(),
						expect.objectContaining({
							rules: {
								'color-contrast': {enabled: false},
								'autocomplete-valid': {enabled: false}
							}
						})
					);
				});
			});
		});

		describe('when axe errors', () => {
			let axeError;
			let rejectedError;

			beforeEach(async () => {
				axeError = new Error('axe error');
				window.axe.run.mockReset();
				window.axe.run.mockRejectedValue(axeError);
				try {
					await runner.run(options, pa11y);
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with the axe error', () => {
				expect(rejectedError).toEqual(axeError);
			});
		});
	});
});

'use strict';

const assert = require('proclaim');
const sinon = require('sinon');
const path = require('path');

describe('lib/runners/axe', () => {
	let result;
	let originalWindow;
	let runner;

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
							target: [
								'mock-selector-1a'
							]
						},
						{
							target: [
								'mock-selector-1b'
							]
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
							target: [
								'mock-selector-2'
							]
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
							target: [
								'mock-selector-3'
							]
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
							target: [
								'iframe-selector-1',
								'mock-selector-4a'
							]
						},
						{
							target: [
								'mock-selector-4b'
							]
						}
					]
				}
			]
		};

		originalWindow = global.window;
		global.window = {
			axe: {
				run: sinon.stub().resolves(result),
				getRules: sinon.stub().returns([])
			},
			document: {
				querySelector: sinon.stub()
			}
		};

		global.window.document.querySelector
			.withArgs('mock-selector-1a').returns('mock-element-1a');
		global.window.document.querySelector
			.withArgs('mock-selector-1b').returns('mock-element-1b');
		global.window.document.querySelector
			.withArgs('mock-selector-2').returns('mock-element-2');
		global.window.document.querySelector
			.withArgs('mock-selector-3').returns('mock-element-3');
		global.window.document.querySelector
			.withArgs('iframe-selector-1 mock-selector-4a').returns('mock-element-4a');
		global.window.document.querySelector
			.withArgs('mock-selector-4b').returns('mock-element-4b');

		runner = require('../../../../lib/runners/axe');
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
		const scriptPath =
			`${path.resolve(__dirname, '..', '..', '..', '..')}` +
			`${path.normalize('/node_modules/axe-core')}/axe.min.js`;
		assert.isArray(runner.scripts);
		assert.deepEqual(runner.scripts, [scriptPath]);
	});

	it('has a `run` method', () => {
		assert.isFunction(runner.run);
	});

	describe('.run(options, pa11y)', () => {
		let options;
		let pa11y;
		let resolvedValue;

		beforeEach(async () => {
			options = {};
			pa11y = {};
			resolvedValue = await runner.run(options, pa11y);
		});

		it('runs aXe', () => {
			assert.calledOnce(global.window.axe.run);
			assert.calledWithExactly(
				global.window.axe.run,
				global.window.document,
				{rules: {}}
			);
		});

		it('resolves with processed and normalised issues', () => {
			assert.deepEqual(resolvedValue, [
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

		describe('when passing the Pa11y option', () => {
			describe('rootElement', () => {
				const cssSelector = '#main';

				beforeEach(async () => {
					options.rootElement = cssSelector;
					await runner.run(options, pa11y);
				});

				it('sets the aXe context', () => {
					assert.calledWithExactly(
						global.window.axe.run,
						cssSelector,
						sinon.match.any
					);
				});
			});

			describe('standard', () => {
				it('supports level A', async () => {
					options.standard = 'WCAG2A';
					await runner.run(options, pa11y);
					assert.calledWithExactly(
						global.window.axe.run,
						sinon.match.any,
						sinon.match.hasNested(
							'runOnly.values',
							['wcag2a', 'wcag21a', 'best-practice']
						)
					);
				});

				it('supports level AA', async () => {
					options.standard = 'WCAG2AA';
					await runner.run(options, pa11y);
					assert.calledWithExactly(
						global.window.axe.run,
						sinon.match.any,
						sinon.match.hasNested(
							'runOnly.values',
							['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa', 'best-practice']
						)
					);
				});
			});

			describe('rules', () => {
				beforeEach(async () => {
					options.rules = ['color-contrast', 'autocomplete-valid', 'something-else'];
					global.window.axe.getRules = sinon.stub().returns([
						{ruleId: 'color-contrast'},
						{ruleId: 'autocomplete-valid'}
					]);
					await runner.run(options, pa11y);
				});

				it('sets the aXe rules', () => {
					assert.calledWithExactly(
						global.window.axe.run,
						sinon.match.any,
						sinon.match.has('rules', {
							'color-contrast': {enabled: true},
							'autocomplete-valid': {enabled: true}
						})
					);
				});
			});

			describe('ignore', () => {
				beforeEach(async () => {
					options.ignore = ['warning', 'notice', 'color-contrast', 'autocomplete-valid'];
					global.window.axe.getRules = sinon.stub().returns([
						{ruleId: 'color-contrast'},
						{ruleId: 'autocomplete-valid'}
					]);
					await runner.run(options, pa11y);
				});

				it('sets the aXe ignore rules', () => {
					assert.calledWithExactly(
						global.window.axe.run,
						sinon.match.any,
						sinon.match.has('rules', {
							'color-contrast': {enabled: false},
							'autocomplete-valid': {enabled: false}
						})
					);
				});
			});
		});

		describe('when aXe errors', () => {
			let axeError;
			let rejectedError;

			beforeEach(async () => {
				axeError = new Error('axe error');
				window.axe.run.reset();
				window.axe.run.rejects(axeError);
				try {
					await runner.run(options, pa11y);
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with the aXe error', () => {
				assert.strictEqual(rejectedError, axeError);
			});

		});

	});

});

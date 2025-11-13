'use strict';

const assert = require('proclaim');
const sinon = require('sinon');
const path = require('path');

describe('lib/runners/axe', function() {
	let result;
	let originalWindow;
	let runner;

	beforeEach(function() {
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
				},
				{
					id: 'mock-id-5',
					description: 'mock description 5',
					impact: 'moderate',
					help: 'mock help 5',
					helpUrl: 'mock-help-url-5',
					nodes: [
						{
							target: [
								'mock-selector-5'
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
		global.window.document.querySelector
			.withArgs('mock-selector-5').returns('mock-element-5');

		runner = require('../../../../lib/runners/axe');
	});

	afterEach(function() {
		global.window = originalWindow;
	});

	it('is an object', function() {
		assert.isObject(runner);
	});

	it('has a `supports` property set to a string', function() {
		assert.isString(runner.supports);
	});

	it('has a `scripts` property set to an array of scripts the runner is dependent on', function() {
		const scriptPath =
			`${path.resolve(__dirname, '..', '..', '..', '..')}` +
			`${path.normalize('/node_modules/axe-core')}/axe.min.js`;
		assert.isArray(runner.scripts);
		assert.deepEqual(runner.scripts, [scriptPath]);
	});

	it('has a `run` method', function() {
		assert.isFunction(runner.run);
	});

	describe('.run(options, pa11y)', function() {
		let options;
		let pa11y;
		let resolvedValue;

		beforeEach(async function() {
			options = {};
			pa11y = {};
			resolvedValue = await runner.run(options, pa11y);
		});

		it('runs axe', function() {
			assert.calledOnce(global.window.axe.run);
			assert.calledWithExactly(
				global.window.axe.run,
				global.window.document,
				{rules: {}}
			);
		});

		it('resolves with processed and normalised issues', function() {
			assert.deepEqual(resolvedValue, [
				{
					code: 'mock-id-1',
					message: 'mock help 1 (mock-help-url-1)',
					type: 'error',
					element: 'mock-element-1a',
					runnerExtras: {
						description: 'mock description 1',
						impact: 'critical',
						needsFurtherReview: false,
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
						needsFurtherReview: false,
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
						needsFurtherReview: false,
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
						needsFurtherReview: false,
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
						needsFurtherReview: true,
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
						needsFurtherReview: true,
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
						needsFurtherReview: true,
						help: 'mock help 4',
						helpUrl: 'mock-help-url-4'
					}
				},
				{
					code: 'mock-id-5',
					message: 'mock help 5 (mock-help-url-5)',
					type: 'warning',
					element: 'mock-element-5',
					runnerExtras: {
						description: 'mock description 5',
						impact: 'moderate',
						needsFurtherReview: true,
						help: 'mock help 5',
						helpUrl: 'mock-help-url-5'
					}
				}
			]);
		});

		describe('when passing the Pa11y option', function() {
			describe('rootElement', function() {
				const cssSelector = '#main';

				beforeEach(async function() {
					options.rootElement = cssSelector;
					await runner.run(options, pa11y);
				});

				it('sets the axe context', function() {
					assert.calledWithExactly(
						global.window.axe.run,
						cssSelector,
						sinon.match.any
					);
				});
			});

			describe('standard', function() {
				it('supports level A', async function() {
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

				it('supports level AA', async function() {
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

			describe('rules', function() {
				beforeEach(async function() {
					options.rules = ['color-contrast', 'autocomplete-valid', 'something-else'];
					global.window.axe.getRules = sinon.stub().returns([
						{ruleId: 'color-contrast'},
						{ruleId: 'autocomplete-valid'}
					]);
					await runner.run(options, pa11y);
				});

				it('sets the axe rules', function() {
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

			describe('ignore', function() {
				beforeEach(async function() {
					options.ignore = ['warning', 'notice', 'color-contrast', 'autocomplete-valid'];
					global.window.axe.getRules = sinon.stub().returns([
						{ruleId: 'color-contrast'},
						{ruleId: 'autocomplete-valid'}
					]);
					await runner.run(options, pa11y);
				});

				it('sets the axe ignore rules', function() {
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

			describe('levelCapForReviewRequired', function() {
				describe('when set to "warning"', function() {
					beforeEach(async function() {
						options.levelCapForReviewRequired = 'warning';
						resolvedValue = await runner.run(options, pa11y);
					});

					it('caps incomplete issues with error-level impact at warning', function() {
						const incompleteIssues = resolvedValue.filter(issue => issue.code === 'mock-id-4');
						assert.strictEqual(incompleteIssues.length, 2);
						assert.strictEqual(incompleteIssues[0].type, 'warning');
						assert.strictEqual(incompleteIssues[1].type, 'warning');
					});

					it('does not affect incomplete issues already at warning level', function() {
						const warningIssue = resolvedValue.find(issue => issue.code === 'mock-id-5');
						assert.strictEqual(warningIssue.type, 'warning');
					});

					it('does not affect incomplete issues already at notice level', function() {
						const noticeIssue = resolvedValue.find(issue => issue.code === 'mock-id-3');
						assert.strictEqual(noticeIssue.type, 'notice');
					});
				});

				describe('when set to "notice"', function() {
					beforeEach(async function() {
						options.levelCapForReviewRequired = 'notice';
						resolvedValue = await runner.run(options, pa11y);
					});

					it('caps incomplete issues with error-level impact at notice', function() {
						const incompleteIssues = resolvedValue.filter(issue => issue.code === 'mock-id-4');
						assert.strictEqual(incompleteIssues.length, 2);
						assert.strictEqual(incompleteIssues[0].type, 'notice');
						assert.strictEqual(incompleteIssues[1].type, 'notice');
					});

					it('caps incomplete issues with warning-level impact at notice', function() {
						const warningIssue = resolvedValue.find(issue => issue.code === 'mock-id-5');
						assert.strictEqual(warningIssue.type, 'notice');
					});

					it('does not affect incomplete issues already at notice level', function() {
						const noticeIssue = resolvedValue.find(issue => issue.code === 'mock-id-3');
						assert.strictEqual(noticeIssue.type, 'notice');
					});
				});

				describe('when set to "error" (explicit)', function() {
					beforeEach(async function() {
						options.levelCapForReviewRequired = 'error';
						resolvedValue = await runner.run(options, pa11y);
					});

					it('does not cap incomplete issues, leaving them at error level', function() {
						const incompleteIssues = resolvedValue.filter(issue => issue.code === 'mock-id-4');
						assert.strictEqual(incompleteIssues.length, 2);
						assert.strictEqual(incompleteIssues[0].type, 'error');
						assert.strictEqual(incompleteIssues[1].type, 'error');
					});
				});

				describe('when left unset, defaults to error', function() {
					beforeEach(async function() {
						resolvedValue = await runner.run(options, pa11y);
					});

					it('does not cap incomplete issues, leaving them at error level', function() {
						const incompleteIssues = resolvedValue.filter(issue => issue.code === 'mock-id-4');
						assert.strictEqual(incompleteIssues.length, 2);
						assert.strictEqual(incompleteIssues[0].type, 'error');
						assert.strictEqual(incompleteIssues[1].type, 'error');
					});
				});
			});
		});

		describe('when axe errors', function() {
			let axeError;
			let rejectedError;

			beforeEach(async function() {
				axeError = new Error('axe error');
				window.axe.run.reset();
				window.axe.run.rejects(axeError);
				try {
					await runner.run(options, pa11y);
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with the axe error', function() {
				assert.strictEqual(rejectedError, axeError);
			});

		});

	});

});

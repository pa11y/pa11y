'use strict';

const assert = require('proclaim');
const sinon = require('sinon');
const path = require('path');

describe('lib/runner', () => {
	let result;
	let originalWindow;
	let runner;

	beforeEach(() => {

		result = {
			violations: [
				{
					id: 'mock-id-1',
					description: 'mock description 1',
					impact: 'mock impact 1',
					help: 'mock help 1',
					helpUrl: 'mock-help-url-1',
					nodes: [
						{
							target: [
								'mock-selector-1'
							]
						}
					]
				},
				{
					id: 'mock-id-2',
					description: 'mock description 2',
					impact: 'mock impact 2',
					help: 'mock help 2',
					helpUrl: 'mock-help-url-2',
					nodes: [
						{
							target: [
								'mock-selector-2'
							]
						}
					]
				}
			],
			incomplete: [
				{
					id: 'mock-id-3',
					description: 'mock description 3',
					impact: 'mock impact 3',
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
					impact: 'mock impact 4',
					help: 'mock help 4',
					helpUrl: 'mock-help-url-4',
					nodes: [
						{
							target: [
								'mock-selector-4'
							]
						}
					]
				}
			]
		};

		originalWindow = global.window;
		global.window = {
			axe: {
				run: sinon.stub().resolves(result)
			},
			document: {
				querySelector: sinon.stub()
			}
		};

		global.window.document.querySelector.withArgs('mock-selector-1').returns('mock-element-1');
		global.window.document.querySelector.withArgs('mock-selector-2').returns('mock-element-2');
		global.window.document.querySelector.withArgs('mock-selector-3').returns('mock-element-3');
		global.window.document.querySelector.withArgs('mock-selector-4').returns('mock-element-4');

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
		assert.deepEqual(runner.scripts, [
			`${path.resolve(__dirname, '..', '..', '..')}/node_modules/axe-core/axe.min.js`
		]);
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
			pa11y = {
				getElementContext: sinon.stub().returns('mock-element-context'),
				getElementSelector: sinon.stub().returns('mock-element-selector')
			};
			resolvedValue = await runner.run(options, pa11y);
		});

		it('runs aXe', () => {
			assert.calledOnce(global.window.axe.run);
			assert.calledWithExactly(global.window.axe.run);
		});

		it('generates context for each issue element', () => {
			assert.callCount(pa11y.getElementContext, 4);
			assert.calledWithExactly(pa11y.getElementContext.getCall(0), 'mock-element-1');
			assert.calledWithExactly(pa11y.getElementContext.getCall(1), 'mock-element-2');
			assert.calledWithExactly(pa11y.getElementContext.getCall(2), 'mock-element-3');
			assert.calledWithExactly(pa11y.getElementContext.getCall(3), 'mock-element-4');
		});

		it('generates selectors for each issue element', () => {
			assert.callCount(pa11y.getElementSelector, 4);
			assert.calledWithExactly(pa11y.getElementSelector.getCall(0), 'mock-element-1');
			assert.calledWithExactly(pa11y.getElementSelector.getCall(1), 'mock-element-2');
			assert.calledWithExactly(pa11y.getElementSelector.getCall(2), 'mock-element-3');
			assert.calledWithExactly(pa11y.getElementSelector.getCall(3), 'mock-element-4');
		});

		it('resolves with processed and normalised issues', () => {
			assert.deepEqual(resolvedValue, [
				{
					code: 'mock-id-1',
					message: 'mock description 1',
					type: 'error',
					context: 'mock-element-context',
					selector: 'mock-element-selector',
					runnerExtras: {
						impact: 'mock impact 1',
						help: 'mock help 1',
						helpUrl: 'mock-help-url-1'
					}
				},
				{
					code: 'mock-id-2',
					message: 'mock description 2',
					type: 'error',
					context: 'mock-element-context',
					selector: 'mock-element-selector',
					runnerExtras: {
						impact: 'mock impact 2',
						help: 'mock help 2',
						helpUrl: 'mock-help-url-2'
					}
				},
				{
					code: 'mock-id-3',
					message: 'mock description 3',
					type: 'warning',
					context: 'mock-element-context',
					selector: 'mock-element-selector',
					runnerExtras: {
						impact: 'mock impact 3',
						help: 'mock help 3',
						helpUrl: 'mock-help-url-3'
					}
				},
				{
					code: 'mock-id-4',
					message: 'mock description 4',
					type: 'warning',
					context: 'mock-element-context',
					selector: 'mock-element-selector',
					runnerExtras: {
						impact: 'mock impact 4',
						help: 'mock help 4',
						helpUrl: 'mock-help-url-4'
					}
				}
			]);
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

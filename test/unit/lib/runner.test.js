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
				},
				{
					id: 'mock-id-no-nodes',
					description: 'mock description no-nodes',
					impact: 'mock impact no-nodes',
					help: 'mock help no-nodes',
					helpUrl: 'mock-help-url-no-nodes',
					nodes: []
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
				run: sinon.stub().resolves(result)
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
		const scriptPath =
			`${path.resolve(__dirname, '..', '..', '..')}` +
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
			assert.calledWithExactly(global.window.axe.run);
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
						impact: 'mock impact 1',
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
						impact: 'mock impact 1',
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
						impact: 'mock impact 2',
						help: 'mock help 2',
						helpUrl: 'mock-help-url-2'
					}
				},
				{
					code: 'mock-id-no-nodes',
					message: 'mock help no-nodes (mock-help-url-no-nodes)',
					type: 'error',
					element: null,
					runnerExtras: {
						description: 'mock description no-nodes',
						impact: 'mock impact no-nodes',
						help: 'mock help no-nodes',
						helpUrl: 'mock-help-url-no-nodes'
					}
				},
				{
					code: 'mock-id-3',
					message: 'mock help 3 (mock-help-url-3)',
					type: 'warning',
					element: 'mock-element-3',
					runnerExtras: {
						description: 'mock description 3',
						impact: 'mock impact 3',
						help: 'mock help 3',
						helpUrl: 'mock-help-url-3'
					}
				},
				{
					code: 'mock-id-4',
					message: 'mock help 4 (mock-help-url-4)',
					type: 'warning',
					element: 'mock-element-4a',
					runnerExtras: {
						description: 'mock description 4',
						impact: 'mock impact 4',
						help: 'mock help 4',
						helpUrl: 'mock-help-url-4'
					}
				},
				{
					code: 'mock-id-4',
					message: 'mock help 4 (mock-help-url-4)',
					type: 'warning',
					element: 'mock-element-4b',
					runnerExtras: {
						description: 'mock description 4',
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

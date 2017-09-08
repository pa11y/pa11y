'use strict';

const assert = require('proclaim');

describe('lib/reporter', () => {
	let reporter;

	beforeEach(() => {
		reporter = require('../../../lib/reporter');
	});

	it('is an object', () => {
		assert.isObject(reporter);
	});

	it('has a `supports` property', () => {
		assert.isString(reporter.supports);
	});

	it('has a `results` method', () => {
		assert.isFunction(reporter.results);
	});

	describe('.results(pa11yResults)', () => {
		let mockPa11yResults;

		beforeEach(() => {
			mockPa11yResults = {
				documentTitle: 'mock title',
				pageUrl: 'http://mock-url/',
				issues: [
					{
						type: 'mock-type-1',
						code: 'mock-code-1',
						message: 'mock-message-1',
						context: 'mock-context-1',
						selector: 'mock-selector-1'
					},
					{
						type: 'mock-type-2',
						code: 'mock-code-2',
						message: 'mock-message-2',
						context: 'mock-context-2',
						selector: 'mock-selector-2'
					},
					{
						type: 'mock-type, "with bad" characters',
						code: 'mock-code, "with bad" characters',
						message: 'mock-message, "with bad" characters',
						context: 'mock-context, "with bad" characters',
						selector: 'mock-selector, "with bad" characters'
					}
				]
			};
		});

		it('returns a CSV string representing the results', () => {
			assert.strictEqual(reporter.results(mockPa11yResults), `
				"type","code","message","context","selector"
				"mock-type-1","mock-code-1","mock-message-1","mock-context-1","mock-selector-1"
				"mock-type-2","mock-code-2","mock-message-2","mock-context-2","mock-selector-2"
				"mock-type, \\"with bad\\" characters","mock-code, \\"with bad\\" characters","mock-message, \\"with bad\\" characters","mock-context, \\"with bad\\" characters","mock-selector, \\"with bad\\" characters"
			`.trim().replace(/\t\t\t\t/g, ''));
		});

	});

	it('has an `error` method', () => {
		assert.isFunction(reporter.error);
	});

	describe('.error(message)', () => {

		it('returns the message unchanged', () => {
			assert.strictEqual(reporter.error('mock message'), 'mock message');
		});

	});

	it('does not have a `begin` method', () => {
		assert.isUndefined(reporter.begin);
	});

	it('does not have a `debug` method', () => {
		assert.isUndefined(reporter.debug);
	});

	it('does not have an `info` method', () => {
		assert.isUndefined(reporter.info);
	});

});

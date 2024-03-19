'use strict';

const assert = require('proclaim');

describe('lib/reporters/csv', function() {
	let csvReporter;

	beforeEach(function() {
		csvReporter = require('../../../../lib/reporters/csv');
	});

	it('is an object', function() {
		assert.isObject(csvReporter);
	});

	it('has a `supports` property', function() {
		assert.isString(csvReporter.supports);
	});

	it('has a `results` method', function() {
		assert.isFunction(csvReporter.results);
	});

	describe('.results(pa11yResults)', function() {
		let mockPa11yResults;

		beforeEach(function() {
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

		it('returns a CSV string representing the results', function() {
			assert.strictEqual(csvReporter.results(mockPa11yResults), `
				"type","code","message","context","selector"
				"mock-type-1","mock-code-1","mock-message-1","mock-context-1","mock-selector-1"
				"mock-type-2","mock-code-2","mock-message-2","mock-context-2","mock-selector-2"
				"mock-type, \\"with bad\\" characters","mock-code, \\"with bad\\" characters","mock-message, \\"with bad\\" characters","mock-context, \\"with bad\\" characters","mock-selector, \\"with bad\\" characters"
			`.trim().replace(/\t\t\t\t/g, ''));
		});

	});

	it('has an `error` method', function() {
		assert.isFunction(csvReporter.error);
	});

	describe('.error(message)', function() {

		it('returns the message unchanged', function() {
			assert.strictEqual(csvReporter.error('mock message'), 'mock message');
		});

	});

	it('does not have a `begin` method', function() {
		assert.isUndefined(csvReporter.begin);
	});

	it('does not have a `debug` method', function() {
		assert.isUndefined(csvReporter.debug);
	});

	it('does not have an `info` method', function() {
		assert.isUndefined(csvReporter.info);
	});

});

'use strict';

const csvReporter = require('../../../../lib/reporters/csv');

describe('lib/reporters/csv', () => {
	it('is an object', () => {
		expect(typeof csvReporter).toBe('object');
	});

	it('has a `supports` property', () => {
		expect(csvReporter.supports).toEqual(expect.any(String));
	});

	it('has a `results` method', () => {
		expect(csvReporter.results).toEqual(expect.any(Function));
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
			expect(csvReporter.results(mockPa11yResults)).toEqual(`
				"type","code","message","context","selector"
				"mock-type-1","mock-code-1","mock-message-1","mock-context-1","mock-selector-1"
				"mock-type-2","mock-code-2","mock-message-2","mock-context-2","mock-selector-2"
				"mock-type, \\"with bad\\" characters","mock-code, \\"with bad\\" characters","mock-message, \\"with bad\\" characters","mock-context, \\"with bad\\" characters","mock-selector, \\"with bad\\" characters"
			`.trim().replace(/\t\t\t\t/g, ''));
		});

	});

	it('has an `error` method', () => {
		expect(csvReporter.error).toEqual(expect.any(Function));
	});

	describe('.error(message)', () => {

		it('returns the message unchanged', () => {
			expect(csvReporter.error('mock message')).toEqual('mock message');
		});

	});

	it('does not have a `begin` method', () => {
		expect(csvReporter.begin).toBeUndefined();
	});

	it('does not have a `debug` method', () => {
		expect(csvReporter.debug).toBeUndefined();
	});

	it('does not have an `info` method', () => {
		expect(csvReporter.info).toBeUndefined();
	});

});

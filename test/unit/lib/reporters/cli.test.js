'use strict';

const cliReporter = require('../../../../lib/reporters/cli');
const kleur = require('kleur');

jest.mock('kleur', () => require('../../mocks/kleur.mock'));

describe('lib/reporters/cli', () => {
	beforeEach(() => {
		kleur.cyan.mockImplementation(str => str);
		kleur.green.mockImplementation(str => str);
		kleur.grey.mockImplementation(str => str);
		kleur.red.mockImplementation(str => str);
		kleur.underline.mockImplementation(str => str);
		kleur.yellow.mockImplementation(str => str);
	});

	it('is an object', () => {
		expect(typeof cliReporter).toBe('object');
	});

	it('has a `supports` property', () => {
		expect(cliReporter.supports).toEqual(expect.any(String));
	});

	it('has a `begin` method', () => {
		expect(cliReporter.begin).toEqual(expect.any(Function));
	});

	describe('.begin()', () => {

		it('returns a welcome message decorated for CLI output', () => {
			expect(cliReporter.begin()).toEqual('\nWelcome to Pa11y\n');
		});

	});

	it('has a `results` method', () => {
		expect(cliReporter.results).toEqual(expect.any(Function));
	});

	describe('.results(pa11yResults)', () => {
		let mockPa11yResults;

		beforeEach(() => {
			mockPa11yResults = {
				documentTitle: 'mock title',
				pageUrl: 'http://mock-url/',
				issues: [
					{
						type: 'error',
						code: 'mock-code-1',
						message: 'mock-message-1',
						context: 'mock-context-1',
						selector: 'mock-selector-1'
					},
					{
						type: 'warning',
						code: 'mock-code-2',
						message: 'mock-message-2',
						context: 'mock-context-2',
						selector: 'mock-selector-2'
					},
					{
						type: 'notice',
						code: 'mock-code-3',
						message: 'mock-message-3',
						context: null,
						selector: 'mock-selector-3'
					}
				]
			};
		});

		it('returns the issues decorated for CLI output', () => {
			expect(cliReporter.results(mockPa11yResults)).toEqual(`
				Results for URL: http://mock-url/

				 • Error: mock-message-1
				   ├── mock-code-1
				   ├── mock-selector-1
				   └── mock-context-1

				 • Warning: mock-message-2
				   ├── mock-code-2
				   ├── mock-selector-2
				   └── mock-context-2

				 • Notice: mock-message-3
				   ├── mock-code-3
				   ├── mock-selector-3
				   └── [no context]

				1 Errors
				1 Warnings
				1 Notices
			`.replace(/\t+/g, ''));
		});

		describe('when `pa11yResults` has no errors', () => {

			beforeEach(() => {
				mockPa11yResults.issues = mockPa11yResults.issues.filter(issue => {
					return issue.type !== 'error';
				});
			});

			it('Does not include the error summary in the output', () => {
				expect(cliReporter.results(mockPa11yResults)).not.toMatch(/1 errors/i);
			});

		});

		describe('when `pa11yResults` has no warnings', () => {

			beforeEach(() => {
				mockPa11yResults.issues = mockPa11yResults.issues.filter(issue => {
					return issue.type !== 'warning';
				});
			});

			it('Does not include the warning summary in the output', () => {
				expect(cliReporter.results(mockPa11yResults)).not.toMatch(/1 warnings/i);
			});

		});

		describe('when `pa11yResults` has no notices', () => {

			beforeEach(() => {
				mockPa11yResults.issues = mockPa11yResults.issues.filter(issue => {
					return issue.type !== 'notice';
				});
			});

			it('Does not include the notice summary in the output', () => {
				expect(cliReporter.results(mockPa11yResults)).not.toMatch(/1 notices/i);
			});

		});

		describe('when `pa11yResults` has no issues', () => {

			beforeEach(() => {
				mockPa11yResults.issues = [];
			});

			it('returns a success message', () => {
				expect(cliReporter.results(mockPa11yResults)).toEqual(`
					No issues found!
				`.replace(/\t+/g, ''));
			});

		});

	});

	it('has an `error` method', () => {
		expect(cliReporter.error).toEqual(expect.any(Function));
	});

	describe('.error(message)', () => {

		it('returns the message decorated for CLI output', () => {
			expect(cliReporter.error('mock message')).toEqual('\nError: mock message\n');
		});

		describe('when `message` already starts with the text "Error:"', () => {

			it('returns the message decorated for CLI output, not adding "Error:"', () => {
				expect(cliReporter.error('Error: mock')).toEqual('\nError: mock\n');
			});

		});

	});

	it('has an `info` method', () => {
		expect(cliReporter.info).toEqual(expect.any(Function));
	});

	describe('.info(message)', () => {

		it('returns the message decorated for CLI output', () => {
			expect(cliReporter.info('mock message')).toEqual(' > mock message');
		});

	});

	it('has a `debug` method', () => {
		expect(cliReporter.debug).toEqual(expect.any(Function));
	});

	describe('.debug(message)', () => {

		it('returns the message decorated for CLI output', () => {
			expect(cliReporter.debug('mock message')).toEqual(' > Debug: mock message');
		});

	});

});

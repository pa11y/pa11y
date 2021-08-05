'use strict';

const mockery = require('mockery');
const assert = require('proclaim');

describe('lib/reporters/cli', () => {
	let kleur;
	let cliReporter;

	beforeEach(() => {
		kleur = require('../../mock/kleur');
		mockery.registerMock('kleur', kleur);
		cliReporter = require('../../../../lib/reporters/cli');
	});

	it('is an object', () => {
		assert.isObject(cliReporter);
	});

	it('has a `supports` property', () => {
		assert.isString(cliReporter.supports);
	});

	it('has a `begin` method', () => {
		assert.isFunction(cliReporter.begin);
	});

	describe('.begin()', () => {

		it('returns a welcome message decorated for CLI output', () => {
			assert.strictEqual(cliReporter.begin(), '\nWelcome to Pa11y\n');
		});

	});

	it('has a `results` method', () => {
		assert.isFunction(cliReporter.results);
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
			assert.strictEqual(cliReporter.results(mockPa11yResults), `
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
				assert.notMatch(cliReporter.results(mockPa11yResults), /1 errors/i);
			});

		});

		describe('when `pa11yResults` has no warnings', () => {

			beforeEach(() => {
				mockPa11yResults.issues = mockPa11yResults.issues.filter(issue => {
					return issue.type !== 'warning';
				});
			});

			it('Does not include the warning summary in the output', () => {
				assert.notMatch(cliReporter.results(mockPa11yResults), /1 warnings/i);
			});

		});

		describe('when `pa11yResults` has no notices', () => {

			beforeEach(() => {
				mockPa11yResults.issues = mockPa11yResults.issues.filter(issue => {
					return issue.type !== 'notice';
				});
			});

			it('Does not include the notice summary in the output', () => {
				assert.notMatch(cliReporter.results(mockPa11yResults), /1 notices/i);
			});

		});

		describe('when `pa11yResults` has no issues', () => {

			beforeEach(() => {
				mockPa11yResults.issues = [];
			});

			it('returns a success message', () => {
				assert.strictEqual(cliReporter.results(mockPa11yResults), `
					No issues found!
				`.replace(/\t+/g, ''));
			});

		});

	});

	it('has an `error` method', () => {
		assert.isFunction(cliReporter.error);
	});

	describe('.error(message)', () => {

		it('returns the message decorated for CLI output', () => {
			assert.strictEqual(cliReporter.error('mock message'), '\nError: mock message\n');
		});

		describe('when `message` already starts with the text "Error:"', () => {

			it('returns the message decorated for CLI output, not adding "Error:"', () => {
				assert.strictEqual(cliReporter.error('Error: mock'), '\nError: mock\n');
			});

		});

	});

	it('has an `info` method', () => {
		assert.isFunction(cliReporter.info);
	});

	describe('.info(message)', () => {

		it('returns the message decorated for CLI output', () => {
			assert.strictEqual(cliReporter.info('mock message'), ' > mock message');
		});

	});

	it('has a `debug` method', () => {
		assert.isFunction(cliReporter.debug);
	});

	describe('.debug(message)', () => {

		it('returns the message decorated for CLI output', () => {
			assert.strictEqual(cliReporter.debug('mock message'), ' > Debug: mock message');
		});

	});

});

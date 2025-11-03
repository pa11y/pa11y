'use strict';

const quibble = require('quibble');
const assert = require('proclaim');

describe('lib/reporters/cli', function() {
	let kleur;
	let cliReporter;

	beforeEach(function() {
		kleur = require('../../mocks/kleur.mock');
		quibble('kleur', kleur);
		cliReporter = require('../../../../lib/reporters/cli');
	});

	it('is an object', function() {
		assert.isObject(cliReporter);
	});

	it('has a `supports` property', function() {
		assert.isString(cliReporter.supports);
	});

	it('has a `begin` method', function() {
		assert.isFunction(cliReporter.begin);
	});

	describe('.begin()', function() {

		it('returns a welcome message decorated for CLI output', function() {
			assert.strictEqual(cliReporter.begin(), '\nWelcome to Pa11y\n');
		});

	});

	it('has a `results` method', function() {
		assert.isFunction(cliReporter.results);
	});

	describe('.results(pa11yResults)', function() {
		let mockPa11yResults;

		beforeEach(function() {
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

		it('returns the issues decorated for CLI output', function() {
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

		describe('when `pa11yResults` has no errors', function() {

			beforeEach(function() {
				mockPa11yResults.issues = mockPa11yResults.issues.filter(issue => {
					return issue.type !== 'error';
				});
			});

			it('Does not include the error summary in the output', function() {
				assert.notMatch(cliReporter.results(mockPa11yResults), /1 errors/i);
			});

		});

		describe('when `pa11yResults` has no warnings', function() {

			beforeEach(function() {
				mockPa11yResults.issues = mockPa11yResults.issues.filter(issue => {
					return issue.type !== 'warning';
				});
			});

			it('Does not include the warning summary in the output', function() {
				assert.notMatch(cliReporter.results(mockPa11yResults), /1 warnings/i);
			});

		});

		describe('when `pa11yResults` has no notices', function() {

			beforeEach(function() {
				mockPa11yResults.issues = mockPa11yResults.issues.filter(issue => {
					return issue.type !== 'notice';
				});
			});

			it('Does not include the notice summary in the output', function() {
				assert.notMatch(cliReporter.results(mockPa11yResults), /1 notices/i);
			});

		});

		describe('when `pa11yResults` has no issues', function() {

			beforeEach(function() {
				mockPa11yResults.issues = [];
			});

			it('returns a success message', function() {
				assert.strictEqual(cliReporter.results(mockPa11yResults), `
					No issues found!
				`.replace(/\t+/g, ''));
			});

		});

	});

	it('has an `error` method', function() {
		assert.isFunction(cliReporter.error);
	});

	describe('.error(message)', function() {

		it('returns the message decorated for CLI output', function() {
			assert.strictEqual(cliReporter.error('mock message'), '\nError: mock message\n');
		});

		describe('when `message` already starts with the text "Error:"', function() {

			it('returns the message decorated for CLI output, not adding "Error:"', function() {
				assert.strictEqual(cliReporter.error('Error: mock'), '\nError: mock\n');
			});

		});

	});

	it('has an `info` method', function() {
		assert.isFunction(cliReporter.info);
	});

	describe('.info(message)', function() {

		it('returns the message decorated for CLI output', function() {
			assert.strictEqual(cliReporter.info('mock message'), ' > mock message');
		});

	});

	it('has a `debug` method', function() {
		assert.isFunction(cliReporter.debug);
	});

	describe('.debug(message)', function() {

		it('returns the message decorated for CLI output', function() {
			assert.strictEqual(cliReporter.debug('mock message'), ' > Debug: mock message');
		});

	});

});

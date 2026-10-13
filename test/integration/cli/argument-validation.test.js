'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI argument validation', function() {
	let pa11yResponse;

	describe('when help is requested', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli('https://example.com', {
				arguments: ['--help']
			});
		});

		it('groups options by runner and preserves the runner and reporter short flags', function() {
			const {output} = pa11yResponse;
			const commonOptionsIndex = output.indexOf('Common options (all runners):');
			const htmlcsOptionsIndex = output.indexOf('htmlcs runner options:');
			const axeOptionsIndex = output.indexOf('axe runner options:');

			assert.isTrue(commonOptionsIndex >= 0);
			assert.isTrue(htmlcsOptionsIndex > commonOptionsIndex);
			assert.isTrue(axeOptionsIndex > htmlcsOptionsIndex);
			assert.include(output, '-e, --runner <runner>');
			assert.include(output, '-r, --reporter <reporter>');
		});

	});

	describe('when legacy short flags are used', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'-e', 'htmlcs',
					'-r', 'json'
				]
			});
		});

		it('uses the runner and reporter options', function() {
			assert.isArray(pa11yResponse.json);
		});

	});

	describe('when an unknown runner is specified', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli('https://example.com', {
				arguments: ['--runner', 'potato']
			});
		});

		describe('when an unknown reporter is specified', function() {

			before(async function() {
				pa11yResponse = await runPa11yCli('https://example.com', {
					arguments: ['--reporter', 'potato']
				});
			});

			it('returns a helpful error without launching Pa11y', function() {
				assert.strictEqual(pa11yResponse.exitCode, 1);
				assert.include(pa11yResponse.output, 'Error: Reporter "potato" could not be found');
				assert.notInclude(pa11yResponse.output, 'Welcome to Pa11y');
			});

		});

		it('returns a helpful error without launching Pa11y', function() {
			assert.strictEqual(pa11yResponse.exitCode, 1);
			assert.include(pa11yResponse.output, 'Error: Runner "potato" could not be found');
			assert.include(pa11yResponse.output, 'Run pa11y --help to see valid options.');
			assert.notInclude(pa11yResponse.output, 'Require stack');
			assert.notInclude(pa11yResponse.output, 'Welcome to Pa11y');
		});

	});

	describe('when a standard outside the supported values is specified', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli('https://example.com', {
				arguments: ['--standard', 'WCAG3']
			});
		});

		it('returns a helpful error without launching Pa11y', function() {
			assert.strictEqual(pa11yResponse.exitCode, 1);
			assert.include(pa11yResponse.output, 'Error: Standard must be one of WCAG2A, WCAG2AA, WCAG2AAA');
			assert.notInclude(pa11yResponse.output, 'Welcome to Pa11y');
		});

	});

	describe('when a level outside the supported values is specified', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli('https://example.com', {
				arguments: ['--level', 'fatal']
			});
		});

		it('returns a helpful error without launching Pa11y', function() {
			assert.strictEqual(pa11yResponse.exitCode, 1);
			assert.include(pa11yResponse.output, 'Error: Level must be one of error, warning, notice, none');
			assert.notInclude(pa11yResponse.output, 'Welcome to Pa11y');
		});

	});

	describe('when a non-numeric threshold is specified', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli('https://example.com', {
				arguments: ['--threshold', 'abc']
			});
		});

		it('returns a helpful error without launching Pa11y', function() {
			assert.strictEqual(pa11yResponse.exitCode, 1);
			assert.include(pa11yResponse.output, 'Error: -T must be a number');
			assert.notInclude(pa11yResponse.output, 'Welcome to Pa11y');
		});

	});

});

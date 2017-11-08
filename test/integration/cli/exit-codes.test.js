'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI exit codes', () => {
	let pa11yResponse;

	describe('when Pa11y is run on a page with no errors', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/notices`);
		});

		it('exits with a code of `0`', () => {
			assert.strictEqual(pa11yResponse.exitCode, 0);
		});

	});

	describe('when Pa11y is run on a page with errors', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`);
		});

		it('exits with a code of `2`', () => {
			assert.strictEqual(pa11yResponse.exitCode, 2);
		});

	});

	// This has to be skipped for now, some ISPs hijack hostnames that can't
	// be resolved (looking at you TalkTalk). We could do with finding a better
	// way to test this later
	describe.skip('when Pa11y is run on a page that can\'t be loaded', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli('notahost');
		});

		it('exits with a code of `1`', () => {
			assert.strictEqual(pa11yResponse.exitCode, 1);
		});

	});

	describe('when the `--level` flag is set to "warning"', () => {

		describe('and Pa11y is run on a page with no warnings or errors', () => {

			before(async () => {
				pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/notices`, {
					arguments: [
						'--include-notices',
						'--include-warnings',
						'--level', 'warning'
					]
				});
			});

			it('exits with a code of `0`', () => {
				assert.strictEqual(pa11yResponse.exitCode, 0);
			});

		});

		describe('and Pa11y is run on a page with warnings', () => {

			before(async () => {
				pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/warnings`, {
					arguments: [
						'--include-notices',
						'--include-warnings',
						'--level', 'warning'
					]
				});
			});

			it('exits with a code of `2`', () => {
				assert.strictEqual(pa11yResponse.exitCode, 2);
			});

		});

	});

	describe('when the `--level` flag is set to "notice"', () => {

		describe('and Pa11y is run on a page with no notices, warnings, or errors', () => {

			before(async () => {
				pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/notices`, {
					arguments: [
						'--include-notices',
						'--include-warnings',
						'--level', 'notice',
						// We can't build a page that doesn't include notices, so we have
						// to fake it by ignoring the only one there is
						'--ignore', 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2'
					]
				});
			});

			it('exits with a code of `0`', () => {
				assert.strictEqual(pa11yResponse.exitCode, 0);
			});

		});

		describe('and Pa11y is run on a page with notices', () => {

			before(async () => {
				pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/notices`, {
					arguments: [
						'--include-notices',
						'--include-warnings',
						'--level', 'notice'
					]
				});
			});

			it('exits with a code of `2`', () => {
				assert.strictEqual(pa11yResponse.exitCode, 2);
			});

		});

	});

	describe('when the `--threshold` flag is set to more than the number of errors present', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/many-errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--threshold', '5'
				]
			});
		});

		it('exits with a code of `0`', () => {
			assert.strictEqual(pa11yResponse.exitCode, 0);
		});

	});

	describe('when the `--threshold` flag is set to exactly the number of errors present', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/many-errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--threshold', '4'
				]
			});
		});

		it('exits with a code of `0`', () => {
			assert.strictEqual(pa11yResponse.exitCode, 0);
		});

	});

});

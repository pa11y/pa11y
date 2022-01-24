'use strict';

const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI reporter CLI', () => {
	let pa11yResponse;

	describe('when the `--reporter` flag is set to "cli"', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--reporter', 'cli'
				]
			});
		});

		it('outputs issues to CLI', () => {
			expect(pa11yResponse.stdout).toMatch(/^Results for URL: .*\/errors$/im);
			expect(pa11yResponse.stdout).toMatch(/^.*Error: .*$/im);
			expect(pa11yResponse.stdout).toMatch(/^1 Errors$/im);
		});

	});

	describe('when the `reporter` config is set to "cli"', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--config', './mock/config/reporter-cli.json'
				]
			});
		});

		it('outputs issues to CLI', () => {
			expect(pa11yResponse.stdout).toMatch(/^Results for URL: .*\/errors$/im);
			expect(pa11yResponse.stdout).toMatch(/^.*Error: .*$/im);
			expect(pa11yResponse.stdout).toMatch(/^1 Errors$/im);
		});

	});

});

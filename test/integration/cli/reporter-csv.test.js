'use strict';

const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI reporter CSV', () => {
	let pa11yResponse;

	describe('when the `--reporter` flag is set to "csv"', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--reporter', 'csv'
				]
			});
		});

		it('outputs issues in CSV format', () => {
			const lines = pa11yResponse.stdout.trim().split('\n');
			expect(lines).toHaveLength(29);
			expect(lines[0]).toEqual('"type","code","message","context","selector"');
			lines.slice(1).forEach(line => {
				expect(line).toMatch(/^"(error|warning|notice)","[^"]+","[^"]+",(".*"),"[^"]*"$/i);
			});
		});

	});

	describe('when the `--reporter` config is set to "csv"', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--config', './mock/config/reporter-csv.json'
				]
			});
		});

		it('outputs issues in CSV format', () => {
			const lines = pa11yResponse.stdout.trim().split('\n');
			expect(lines).toHaveLength(29);
			expect(lines[0]).toEqual('"type","code","message","context","selector"');
			lines.slice(1).forEach(line => {
				expect(line).toMatch(/^"(error|warning|notice)","[^"]+","[^"]+",(".*"),"[^"]*"$/i);
			});
		});

	});

});

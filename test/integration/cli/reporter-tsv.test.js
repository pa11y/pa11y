'use strict';

const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI reporter TSV', () => {
	let pa11yResponse;

	describe('when the `--reporter` flag is set to "tsv"', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--reporter', 'tsv'
				]
			});
		});

		it('outputs issues in TSV format', () => {
			const lines = pa11yResponse.stdout.trim().split('\n');
			expect(lines).toHaveLength(29);
			expect(lines[0]).toEqual('"type"\t"code"\t"message"\t"context"\t"selector"');
			lines.slice(1).forEach(line => {
				expect(line).toMatch(/^"(error|warning|notice)"\t"[^"]+"\t"[^"]+"\t(".*"|null)\t"[^"]*"$/i);
			});
		});

	});

	describe('when the `--reporter` config is set to "tsv"', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--config', './mock/config/reporter-tsv.json'
				]
			});
		});

		it('outputs issues in TSV format', () => {
			const lines = pa11yResponse.stdout.trim().split('\n');
			expect(lines).toHaveLength(29);
			expect(lines[0]).toEqual('"type"\t"code"\t"message"\t"context"\t"selector"');
			lines.slice(1).forEach(line => {
				expect(line).toMatch(/^"(error|warning|notice)"\t"[^"]+"\t"[^"]+"\t(".*"|null)\t"[^"]*"$/i);
			});
		});

	});

});

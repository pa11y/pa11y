'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI reporter TSV', function() {
	let pa11yResponse;

	describe('when the `--reporter` flag is set to "tsv"', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--reporter', 'tsv'
				]
			});
		});

		it('outputs issues in TSV format', function() {
			const lines = pa11yResponse.stdout.trim().split('\n');
			assert.lengthEquals(lines, 29);
			assert.strictEqual(lines[0], '"type"\t"code"\t"message"\t"context"\t"selector"');
			lines.slice(1).forEach(line => {
				assert.match(line, /^"(error|warning|notice)"\t"[^"]+"\t"[^"]+"\t(".*"|null)\t"[^"]*"$/i);
			});
		});

	});

	describe('when the `--reporter` config is set to "tsv"', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--config', './mock/config/reporter-tsv.json'
				]
			});
		});

		it('outputs issues in TSV format', function() {
			const lines = pa11yResponse.stdout.trim().split('\n');
			assert.lengthEquals(lines, 29);
			assert.strictEqual(lines[0], '"type"\t"code"\t"message"\t"context"\t"selector"');
			lines.slice(1).forEach(line => {
				assert.match(line, /^"(error|warning|notice)"\t"[^"]+"\t"[^"]+"\t(".*"|null)\t"[^"]*"$/i);
			});
		});

	});

});

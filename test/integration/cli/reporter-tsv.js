'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI reporter TSV', () => {
	let pa11yResponse;

	describe('when the `--reporter` flag is set to "tsv"', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--reporter', 'tsv'
				]
			});
		});

		it('outputs issues in TSV format', () => {
			const lines = pa11yResponse.output.trim().split('\n');
			assert.lengthEquals(lines, 4);
			assert.strictEqual(lines[0], '"type"\t"code"\t"message"\t"context"\t"selector"');
			lines.slice(1).forEach(line => {
				assert.match(line, /^"(error|warning|notice)"\t"[^"]+"\t"[^"]+"\t".*"\t"[^"]+"$/i);
			});
		});

	});

});

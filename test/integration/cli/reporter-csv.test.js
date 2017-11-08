'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI reporter CSV', () => {
	let pa11yResponse;

	describe('when the `--reporter` flag is set to "csv"', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--reporter', 'csv'
				]
			});
		});

		it('outputs issues in CSV format', () => {
			const lines = pa11yResponse.output.trim().split('\n');
			assert.lengthEquals(lines, 5);
			assert.strictEqual(lines[0], '"type","code","message","context","selector"');
			lines.slice(1).forEach(line => {
				assert.match(line, /^"(error|warning|notice)","[^"]+","[^"]+",".*","[^"]+"$/i);
			});
		});

	});

});

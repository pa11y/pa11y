'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI timeout', () => {
	let pa11yResponse;

	describe('when the `--timeout` flag is set to less time than the page takes to load', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/timeout`, {
				arguments: [
					'--timeout', '100'
				]
			});
		});

		it('exits with a code of `1`', () => {
			assert.strictEqual(pa11yResponse.exitCode, 1);
		});

		it('outputs a timeout error', () => {
			assert.match(pa11yResponse.output, /timeouterror/i);
			assert.match(pa11yResponse.output, /pa11y timed out/i);
			assert.match(pa11yResponse.output, /100ms/i);
		});

	});

});

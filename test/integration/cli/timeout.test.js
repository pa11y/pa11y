'use strict';

const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI timeout', () => {
	let pa11yResponse;

	describe('when the `--timeout` flag is set to less time than the page takes to load', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/timeout`, {
				arguments: [
					'--timeout', '100'
				]
			});
		});

		it('exits with a code of `1`', () => {
			expect(pa11yResponse.exitCode).toEqual(1);
		});

		it('outputs a timeout error', () => {
			expect(pa11yResponse.output).toMatch(/timeouterror/i);
			expect(pa11yResponse.output).toMatch(/pa11y timed out/i);
			expect(pa11yResponse.output).toMatch(/100ms/i);
		});

	});

});

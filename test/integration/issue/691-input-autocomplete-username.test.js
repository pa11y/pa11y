'use strict';

const runPa11yCli = require('../helper/pa11y-cli');

describe('pa11y/pa11y#691: With input[autocomplete*=username]', () => {
	it('CLI invocation produces results, avoiding exit with TypeError', async () => {
		const {output} = await runPa11yCli(
			`${global.mockWebsiteAddress}/issue/691-input-autocomplete-username`, {
				arguments: ['--reporter', 'cli']
			}
		);
		expect(output).toMatch(/Results for URL/i);
	});
});

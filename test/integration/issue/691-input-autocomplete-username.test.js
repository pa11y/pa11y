'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

describe('pa11y/pa11y#691: With <input autocomplete="username"> (implicit type)', function() {
	it('CLI invocation produces results, avoiding exit with TypeError', async function() {
		const {output} = await runPa11yCli(
			`${global.mockWebsiteAddress}/issue/691-input-autocomplete-username`, {
				arguments: ['--reporter', 'cli']
			}
		);
		assert.match(output, /Results for URL/i);
	});
});

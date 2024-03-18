'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

describe('pa11y/pa11y#373: With empty HTML lang attribute', () => {
	it('CLI invocation produces results, avoiding exit with TypeError or any error', async function() {
		const {output} = await runPa11yCli(
			`${global.mockWebsiteAddress}/issue/373-html-emptylang-typeerror`, {
				arguments: ['--reporter', 'cli']
			}
		);
		assert.match(output, /Results for URL/i);
	});
});

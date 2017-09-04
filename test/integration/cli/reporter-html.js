'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI reporter HTML', () => {
	let pa11yResponse;

	describe('when the `--reporter` flag is set to "html"', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--reporter', 'html'
				]
			});
		});

		it('outputs issues in HTML format', () => {
			assert.match(pa11yResponse.output, /<!doctype html>/i);
			assert.match(pa11yResponse.output, new RegExp(`${global.mockWebsiteAddress}/errors`, 'i'));
			assert.match(pa11yResponse.output, /error/i);
			assert.match(pa11yResponse.output, /warning/i);
			assert.match(pa11yResponse.output, /notice/i);
			assert.match(pa11yResponse.output, /wcag2aa/i);
		});

	});

});

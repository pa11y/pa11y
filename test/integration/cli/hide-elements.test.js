'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI hide-elements', () => {
	let pa11yResponse;

	describe('when the `--hide-elements` flag is set', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/hide-elements`, {
				arguments: [
					'--hide-elements', '#example-hide-elements',
					'--reporter', 'json'
				]
			});
		});

		it('ignores issues on and inside the hidden elements', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 1);
		});

	});

	describe('when the `--hide-elements` flag is set to multiple selectors', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/hide-elements`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--hide-elements', 'img, p',
					'--reporter', 'json'
				]
			});
		});

		it('ignores issues on and inside the hidden elements', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 2);
		});

	});

});

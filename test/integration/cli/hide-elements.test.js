'use strict';

const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI hide-elements', () => {
	let pa11yResponse;

	describe('when the `--hide-elements` flag is set', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/hide-elements`, {
				arguments: [
					'--hide-elements', '#example-hide-elements',
					'--reporter', 'json'
				]
			});
		});

		it('ignores issues on and inside the hidden elements', () => {
			expect(pa11yResponse.json).toHaveLength(1);
		});

	});

	describe('when the `--hide-elements` flag is set to multiple selectors', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/hide-elements`, {
				arguments: [
					'--include-warnings',
					'--hide-elements', 'img, a',
					'--reporter', 'json'
				]
			});
		});

		it('ignores issues on and inside the hidden elements', () => {
			expect(pa11yResponse.json).toHaveLength(2);
		});

	});

});

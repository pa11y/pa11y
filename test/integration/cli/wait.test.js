'use strict';

const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI wait', () => {
	let pa11yResponse;

	describe('when the `--wait` flag is set', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/wait`, {
				arguments: [
					'--wait', '2500',
					'--reporter', 'json'
				]
			});
		});

		it('waits for the specified amount of time before running tests', () => {
			expect(pa11yResponse.json).toHaveLength(0);
		});

	});

});

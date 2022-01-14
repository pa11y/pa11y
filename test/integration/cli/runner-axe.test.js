'use strict';

const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI runner aXe', () => {
	let pa11yResponse;

	beforeAll(async () => {
		pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
			arguments: [
				'--runner', 'axe',
				'--reporter', 'json',
				'--include-notices',
				'--include-warnings'
			]
		});
	});

	it('outputs the expected issues', () => {
		expect(pa11yResponse.json).toHaveLength(4);
		expect(pa11yResponse.json[0].type).toEqual('error');
		expect(pa11yResponse.json[1].type).toEqual('warning');
		expect(pa11yResponse.json[2].type).toEqual('warning');
		expect(pa11yResponse.json[3].type).toEqual('warning');
	});
});

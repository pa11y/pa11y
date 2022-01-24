'use strict';

const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI runner HTML_CodeSniffer', () => {

	it('outputs the expected issues', async () => {
		const pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
			arguments: [
				'--runner', 'htmlcs',
				'--reporter', 'json'
			]
		});

		expect(pa11yResponse.json).toHaveLength(1);
		pa11yResponse.json.forEach(issue => {
			expect(issue.type).toEqual('error');
		});
	});

	it('runs on an AMD site', async () => {
		const pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/AMD`, {
			arguments: [
				'--runner', 'htmlcs',
				'--reporter', 'json',
				'--debug'
			]
		});

		expect(pa11yResponse.json).toHaveLength(1);
		pa11yResponse.json.forEach(issue => {
			expect(issue.type).toEqual('error');
		});
	});
});

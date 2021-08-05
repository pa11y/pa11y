'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

require('../setup.test');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI runner HTML_CodeSniffer', function() {

	it('outputs the expected issues', async function() {
		const pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
			arguments: [
				'--runner', 'htmlcs',
				'--reporter', 'json'
			]
		});

		assert.isArray(pa11yResponse.json);
		assert.lengthEquals(pa11yResponse.json, 1);
		pa11yResponse.json.forEach(issue => {
			assert.equal(issue.type, 'error');
		});
	});

	it('runs on an AMD site', async function() {
		const pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/AMD`, {
			arguments: [
				'--runner', 'htmlcs',
				'--reporter', 'json',
				'--debug'
			]
		});

		assert.isArray(pa11yResponse.json);
		assert.lengthEquals(pa11yResponse.json, 1);
		pa11yResponse.json.forEach(issue => {
			assert.equal(issue.type, 'error');
		});
	});
});

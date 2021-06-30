'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI runner aXe', function() {
	let pa11yResponse;

	before(async function() {
		pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
			arguments: [
				'--runner', 'axe',
				'--reporter', 'json'
			]
		});
	});

	it('outputs the expected issues', function() {
		assert.isArray(pa11yResponse.json);
		assert.lengthEquals(pa11yResponse.json, 4);
		pa11yResponse.json.forEach(issue => {
			assert.equal(issue.type, 'error');
		});
	});
});

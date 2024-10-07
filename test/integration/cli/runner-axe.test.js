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
				'--reporter', 'json',
				'--include-notices',
				'--include-warnings'
			]
		});
	});

	it('outputs the expected issues', function() {
		assert.isArray(pa11yResponse.json);
		assert.lengthEquals(pa11yResponse.json, 3);
		assert.equal(pa11yResponse.json[0].type, 'error');
		assert.equal(pa11yResponse.json[1].type, 'warning');
		assert.equal(pa11yResponse.json[2].type, 'warning');
	});
});

'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI runner axe', function() {
	it('outputs the expected issues', async function() {
		const pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
			arguments: [
				'--runner', 'axe',
				'--reporter', 'json',
				'--include-notices',
				'--include-warnings'
			]
		});

		assert.isArray(pa11yResponse.json);
		assert.lengthEquals(pa11yResponse.json, 3);
		assert.equal(pa11yResponse.json[0].type, 'error');
		assert.equal(pa11yResponse.json[1].type, 'warning');
		assert.equal(pa11yResponse.json[2].type, 'warning');
	});
});

'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI environment', function() {
	let pa11yResponse;

	before(async function() {
		pa11yResponse = await runPa11yCli('', {
			arguments: [
				'--environment'
			]
		});
	});

	it('exits with a code of `0`', function() {
		assert.strictEqual(pa11yResponse.exitCode, 0);
	});

	it('respondes with information about the user\'s environment', function() {
		assert.match(pa11yResponse.output, /OS/);
		assert.match(pa11yResponse.output, /CPU/);
		assert.match(pa11yResponse.output, /Memory/);
		assert.match(pa11yResponse.output, /Node/);
		assert.match(pa11yResponse.output, /npm/);
	});

});

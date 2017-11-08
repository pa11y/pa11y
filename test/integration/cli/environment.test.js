'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI environment', () => {
	let pa11yResponse;

	before(async () => {
		pa11yResponse = await runPa11yCli('', {
			arguments: [
				'--environment'
			]
		});
	});

	it('exits with a code of `0`', () => {
		assert.strictEqual(pa11yResponse.exitCode, 0);
	});

	it('respondes with information about the user\'s environment', () => {
		assert.match(pa11yResponse.output, /pa11y:\s+\d+\.\d+\.\d+/i);
		assert.match(pa11yResponse.output, /node\.js:\s+\d+\.\d+\.\d+/i);
		assert.match(pa11yResponse.output, /npm:\s+\d+\.\d+\.\d+/i);
		assert.match(pa11yResponse.output, /os:\s+[^(]+\s\([^)]+\)/i);
	});

});

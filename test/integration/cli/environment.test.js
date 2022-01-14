'use strict';

const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI environment', () => {
	let pa11yResponse;

	beforeAll(async () => {
		pa11yResponse = await runPa11yCli('', {
			arguments: [
				'--environment'
			]
		});
	});

	it('exits with a code of `0`', () => {
		expect(pa11yResponse.exitCode).toEqual(0);
	});

	it('responds with information about the user\'s environment', () => {
		expect(pa11yResponse.output).toMatch(/OS/);
		expect(pa11yResponse.output).toMatch(/CPU/);
		expect(pa11yResponse.output).toMatch(/Memory/);
		expect(pa11yResponse.output).toMatch(/Node/);
		expect(pa11yResponse.output).toMatch(/npm/);
		expect(pa11yResponse.output).toMatch(/pa11y/);
	});

});

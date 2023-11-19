'use strict';

const runPa11yCli = require('../helper/pa11y-cli');


describe('CLI runner axe', () => {

	it('finds the 4 expected issues', async () => {
		const {json: issues} = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
			arguments: [
				'--runner', 'axe',
				'--reporter', 'json',
				'--include-notices',
				'--include-warnings'
			]
		});

		expect(issues).toHaveLength(4);
		expect(issues[0].type).toEqual('error');
		expect(issues[1].type).toEqual('warning');
		expect(issues[2].type).toEqual('warning');
		expect(issues[3].type).toEqual('warning');
	});
});

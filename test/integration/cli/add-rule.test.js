'use strict';

const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI add-rule', () => {
	let pa11yResponse;

	describe('when the `--add-rule` flag is set to an issue code not in the current standard', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/contrast`, {
				arguments: [
					'--add-rule', 'Principle1.Guideline1_4.1_4_6',
					'--reporter', 'json'
				]
			});
		});

		it('detects and outputs issues with the specified code', () => {
			expect(pa11yResponse.json).toHaveLength(1);
			expect(pa11yResponse.json[0].code).toEqual('WCAG2AA.Principle1.Guideline1_4.1_4_6.G17.Fail');
		});

	});

});

'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI add-rule', () => {
	let pa11yResponse;

	describe('when the `--add-rule` flag is set to an issue code not in the current standard', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/contrast`, {
				arguments: [
					'--add-rule', 'Principle1.Guideline1_4.1_4_6',
					'--reporter', 'json'
				]
			});
		});

		it('detects and outputs issues with the specified code', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 1);
			assert.strictEqual(pa11yResponse.json[0].code, 'WCAG2AA.Principle1.Guideline1_4.1_4_6.G17.Fail');
		});

	});

});

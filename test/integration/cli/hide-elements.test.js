'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI hide-elements', function() {
	let pa11yResponse;

	describe('when the `--hide-elements` flag is set', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/hide-elements`, {
				arguments: [
					'--hide-elements', '#example-hide-elements',
					'--reporter', 'json'
				]
			});
		});

		it('ignores issues on and inside the hidden elements', function() {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 1);
		});

	});

	describe('when the `--hide-elements` flag is set to multiple selectors', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/hide-elements`, {
				arguments: [
					'--include-warnings',
					'--hide-elements', 'img, a',
					'--reporter', 'json'
				]
			});
		});

		it('ignores issues on and inside the hidden elements', function() {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 2);
		});

	});

});

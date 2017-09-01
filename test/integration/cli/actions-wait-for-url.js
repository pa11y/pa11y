'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI action "wait-for-url"', () => {
	let pa11yResponse;

	describe('when waiting for a hash change', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/actions-wait-for-url-hash`, {
				arguments: [
					'--config', './mock/config/actions-wait-for-url-hash.json',
					'--reporter', 'json',
					'--ignore', 'warning;notice' // This is so we only deal with errors
				]
			});
		});

		it('waits for the hash to change before running tests', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 0);
		});

	});

	describe('when waiting for a path change', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/actions-wait-for-url-path`, {
				arguments: [
					'--config', './mock/config/actions-wait-for-url-path.json',
					'--reporter', 'json',
					'--ignore', 'warning;notice' // This is so we only deal with errors
				]
			});
		});

		it('waits for the path to change before running tests', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 0);
		});

	});

});

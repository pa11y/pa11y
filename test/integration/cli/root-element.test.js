'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');
const {groupResponses} = require('../helper/pa11y-responses');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI root-element', function() {
	let pa11yResponse;

	describe('when the `--root-element` flag is set to an existing element selector', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/root-element`, {
				arguments: [
					'--root-element', '#example-root-element',
					'--reporter', 'json'
				]
			});
		});

		it('ignores issues outside of the root element', function() {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 0);
		});

	});

	describe('when the `--root-element` flag is set to a non-existant element selector', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/root-element`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--root-element', '#not-a-real-thing',
					'--reporter', 'json'
				]
			});
		});

		it('defaults back to outputting all issues', function() {
			assert.isArray(pa11yResponse.json);

			const responses = groupResponses(pa11yResponse.json);
			assert.lengthEquals(responses.error, 1);
			assert.lengthEquals(responses.warning, 1);
			assert.lengthEquals(responses.notice, 26);
		});

	});

});

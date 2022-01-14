'use strict';

const runPa11yCli = require('../helper/pa11y-cli');
const {groupResponses} = require('../helper/pa11y-responses');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI root-element', () => {
	let pa11yResponse;

	describe('when the `--root-element` flag is set to an existing element selector', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/root-element`, {
				arguments: [
					'--root-element', '#example-root-element',
					'--reporter', 'json'
				]
			});
		});

		it('ignores issues outside of the root element', () => {
			expect(pa11yResponse.json).toHaveLength(0);
		});

	});

	describe('when the `--root-element` flag is set to a non-existant element selector', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/root-element`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--root-element', '#not-a-real-thing',
					'--reporter', 'json'
				]
			});
		});

		it('defaults back to outputting all issues', () => {
			expect(pa11yResponse.json.length).toBeGreaterThanOrEqual(0);

			const responses = groupResponses(pa11yResponse.json);
			expect(responses.error).toHaveLength(1);
			expect(responses.warning).toHaveLength(1);
			expect(responses.notice).toHaveLength(26);
		});

	});

});

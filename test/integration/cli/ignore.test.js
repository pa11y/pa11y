'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');
const {groupResponses} = require('../helper/pa11y-responses');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI ignore', function() {
	let pa11yResponse;

	describe('when the `--ignore` flag is set to "warning"', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--ignore', 'warning',
					'--reporter', 'json'
				]
			});
		});

		it('ignores warnings', function() {
			assert.isArray(pa11yResponse.json);

			const responses = groupResponses(pa11yResponse.json);
			assert.lengthEquals(responses.warning, 0);
			assert.lengthEquals(responses.notice, 26);
			assert.lengthEquals(responses.error, 1);
		});

	});

	describe('when the `--ignore` flag is set to "warning;notice"', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--ignore', 'warning;notice',
					'--reporter', 'json'
				]
			});
		});

		it('ignores warnings and notices', function() {
			assert.isArray(pa11yResponse.json);

			const responses = groupResponses(pa11yResponse.json);
			assert.lengthEquals(responses.warning, 0);
			assert.lengthEquals(responses.notice, 0);
			assert.lengthEquals(responses.error, 1);
		});

	});

	describe('when the `--ignore` flag is set multiple times', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--ignore', 'warning',
					'--ignore', 'notice',
					'--reporter', 'json'
				]
			});
		});

		it('ignores all of the flagged items', function() {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 1);
			pa11yResponse.json.forEach(issue => {
				assert.notStrictEqual(issue.type, 'warning');
				assert.notStrictEqual(issue.type, 'notice');
			});
		});

	});

	describe('when the `--ignore` flag is set to an issue code', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--ignore', 'WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2',
					'--reporter', 'json'
				]
			});
		});

		it('ignores issues with the given code', function() {
			assert.isArray(pa11yResponse.json);

			const responses = groupResponses(pa11yResponse.json);
			assert.lengthEquals(responses.warning, 1);
			assert.lengthEquals(responses.notice, 26);
			assert.lengthEquals(responses.error, 0);

			responses.notice.forEach(issue => {
				assert.notStrictEqual(issue.code, 'WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2');
			});
		});

	});

});

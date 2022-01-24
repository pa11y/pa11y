'use strict';

const runPa11yCli = require('../helper/pa11y-cli');
const {groupResponses} = require('../helper/pa11y-responses');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI ignore', () => {
	let pa11yResponse;

	describe('when the `--ignore` flag is set to "warning"', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--ignore', 'warning',
					'--reporter', 'json'
				]
			});
		});

		it('ignores warnings', () => {
			expect(pa11yResponse.json.length).toBeGreaterThanOrEqual(0);

			const responses = groupResponses(pa11yResponse.json);
			expect(responses.warning).toHaveLength(0);
			expect(responses.notice).toHaveLength(26);
			expect(responses.error).toHaveLength(1);
		});

	});

	describe('when the `--ignore` flag is set to "warning;notice"', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--ignore', 'warning;notice',
					'--reporter', 'json'
				]
			});
		});

		it('ignores warnings and notices', () => {
			expect(pa11yResponse.json.length).toBeGreaterThanOrEqual(0);

			const responses = groupResponses(pa11yResponse.json);
			expect(responses.warning).toHaveLength(0);
			expect(responses.notice).toHaveLength(0);
			expect(responses.error).toHaveLength(1);
		});

	});

	describe('when the `--ignore` flag is set multiple times', () => {

		beforeAll(async () => {
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

		it('ignores all of the flagged items', () => {
			expect(pa11yResponse.json).toHaveLength(1);
			pa11yResponse.json.forEach(issue => {
				expect(issue.type).not.toEqual('warning');
				expect(issue.type).not.toEqual('notice');
			});
		});

	});

	describe('when the `--ignore` flag is set to an issue code', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--ignore', 'WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2',
					'--reporter', 'json'
				]
			});
		});

		it('ignores issues with the given code', () => {
			expect(pa11yResponse.json.length).toBeGreaterThanOrEqual(0);

			const responses = groupResponses(pa11yResponse.json);
			expect(responses.warning).toHaveLength(1);
			expect(responses.notice).toHaveLength(26);
			expect(responses.error).toHaveLength(0);

			responses.notice.forEach(issue => {
				expect(issue.code).not.toEqual('WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2');
			});
		});

	});

});

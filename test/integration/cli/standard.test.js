'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI standard', () => {
	let pa11yResponse;

	describe('when the `--standard` flag is set to "WCAG2A"', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--standard', 'WCAG2A',
					'--reporter', 'json'
				]
			});
		});

		it('outputs the expected issues', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 4);
			pa11yResponse.json.forEach(issue => {
				assert.match(issue.code, /^WCAG2A\./);
			});
		});

	});

	describe('when the `--standard` flag is set to "WCAG2AAA"', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--standard', 'WCAG2AAA',
					'--reporter', 'json'
				]
			});
		});

		it('outputs the expected issues', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 4);
			pa11yResponse.json.forEach(issue => {
				assert.match(issue.code, /^WCAG2AAA\./);
			});
		});

	});

	describe('when the `--standard` flag is set to "Section508"', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--standard', 'Section508',
					'--reporter', 'json'
				]
			});
		});

		it('outputs the expected issues', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 1);
			pa11yResponse.json.forEach(issue => {
				assert.match(issue.code, /^Section508\./);
			});
		});

	});

});

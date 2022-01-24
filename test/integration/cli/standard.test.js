'use strict';

const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI standard', () => {
	let pa11yResponse;

	describe('when the `--standard` flag is set to "WCAG2A"', () => {

		beforeAll(async () => {
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
			expect(pa11yResponse.json.length).toBeGreaterThanOrEqual(0);
			expect(pa11yResponse.json).toHaveLength(15);
			pa11yResponse.json.forEach(issue => {
				expect(issue.code).toMatch(/^WCAG2A\./);
			});
		});

	});

	describe('when the `--standard` flag is set to "WCAG2AAA"', () => {

		beforeAll(async () => {
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
			expect(pa11yResponse.json.length).toBeGreaterThanOrEqual(0);
			expect(pa11yResponse.json).toHaveLength(43);
			pa11yResponse.json.forEach(issue => {
				expect(issue.code).toMatch(/^WCAG2AAA\./);
			});
		});

	});

	describe('when the `standard` config is set to "WCAG2AAA" but the `--standard` flag is set to "WCAG2AA"', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--config', './mock/config/standard.json',
					'--include-notices',
					'--include-warnings',
					'--standard', 'WCAG2AA',
					'--reporter', 'json'
				]
			});
		});

		it('outputs the expected issues', () => {
			expect(pa11yResponse.json.length).toBeGreaterThanOrEqual(0);
			expect(pa11yResponse.json).toHaveLength(28);
			pa11yResponse.json.forEach(issue => {
				expect(issue.code).toMatch(/^WCAG2AA\./);
			});
		});

	});

});

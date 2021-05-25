'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI standard', function() {
	let pa11yResponse;

	describe('when the `--standard` flag is set to "WCAG2A"', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--standard', 'WCAG2A',
					'--reporter', 'json'
				]
			});
		});

		it('outputs the expected issues', function() {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 15);
			pa11yResponse.json.forEach(issue => {
				assert.match(issue.code, /^WCAG2A\./);
			});
		});

	});

	describe('when the `--standard` flag is set to "WCAG2AAA"', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--standard', 'WCAG2AAA',
					'--reporter', 'json'
				]
			});
		});

		it('outputs the expected issues', function() {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 43);
			pa11yResponse.json.forEach(issue => {
				assert.match(issue.code, /^WCAG2AAA\./);
			});
		});

	});

	describe('when the `standard` config is set to "WCAG2AAA" but the `--standard` flag is set to "WCAG2AA"', function() {

		before(async function() {
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

		it('outputs the expected issues', function() {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 28);
			pa11yResponse.json.forEach(issue => {
				assert.match(issue.code, /^WCAG2AA\./);
			});
		});

	});

});

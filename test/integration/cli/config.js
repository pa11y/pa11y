'use strict';

const assert = require('proclaim');
const path = require('path');
const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI config', () => {
	let pa11yResponse;

	describe('when the configuration specifies headers', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/headers`, {
				arguments: [
					'--config', './mock/config/headers.json',
					'--reporter', 'json'
				]
			});
		});

		it('sets headers on the tested page', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 1);
			assert.strictEqual(pa11yResponse.json[0].context, '<title>bar baz</title>');
		});

	});

	describe('when the configuration specifies ignore rules', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/warnings`, {
				arguments: [
					'--config', './mock/config/ignore-warnings.json',
					'--reporter', 'json'
				]
			});
		});

		it('ignores the specified issues', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 0);
		});

	});

	describe('when no configuration is specified but a `pa11y.json` file exists in the working directory', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--reporter', 'json'
				],
				workingDirectory: path.resolve(`${__dirname}/../mock/config`)
			});
		});

		it('loads the default config', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 0);
		});

	});

});

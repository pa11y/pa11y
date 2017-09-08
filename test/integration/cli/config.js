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
					'--include-notices',
					'--include-warnings',
					'--config', './mock/config/headers.json',
					'--reporter', 'json'
				]
			});
		});

		// The test file ../mock/html/headers.html which we test here has request headers output in
		// the page title, so reading the title confirms that headers were sent by Pa11y
		it('sets headers on the tested page', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 1);
			assert.strictEqual(pa11yResponse.json[0].context, '<title>bar baz</title>');
		});

	});

	describe('when the configuration specifies a method', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/method`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--config', './mock/config/method.json',
					'--reporter', 'json'
				]
			});
		});

		// The test file ../mock/html/headers.html which we test here has request headers output in
		// the page title, so reading the title confirms that headers were sent by Pa11y
		it('tests the page using the specified HTTP method', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 1);
			assert.strictEqual(pa11yResponse.json[0].context, '<title>POST</title>');
		});

	});

	describe('when the configuration specifies POST data', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/post-data`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--config', './mock/config/post-data.json',
					'--reporter', 'json'
				]
			});
		});

		// The test file ../mock/html/headers.html which we test here has request headers output in
		// the page title, so reading the title confirms that headers were sent by Pa11y
		it('tests the page using the specified HTTP method', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 1);
			assert.strictEqual(pa11yResponse.json[0].context, '<title>foo=bar&amp;bar=baz</title>');
		});

	});

	describe('when the configuration specifies ignore rules', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/warnings`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
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
					'--include-notices',
					'--include-warnings',
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

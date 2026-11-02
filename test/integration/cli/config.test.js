'use strict';

const assert = require('proclaim');
const path = require('path');
const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI config', function() {
	let pa11yResponse;

	describe('when the configuration specifies headers', function() {

		before(async function() {
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
		it('sets headers on the tested page', function() {
			assert.isArray(pa11yResponse.json);

			const noticeH2522 = pa11yResponse.json.filter(response => response.code === 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2');
			assert.lengthEquals(noticeH2522, 1);
			assert.strictEqual(noticeH2522[0].context, '<title>bar baz</title>');
		});

	});

	describe('when the configuration specifies a method', function() {

		before(async function() {
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
		it('tests the page using the specified HTTP method', function() {
			assert.isArray(pa11yResponse.json);

			const noticeH2522 = pa11yResponse.json.filter(response => response.code === 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2');
			assert.lengthEquals(noticeH2522, 1);
			assert.strictEqual(noticeH2522[0].context, '<title>POST</title>');
		});

	});

	describe('when the configuration specifies POST data', function() {

		before(async function() {
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
		it('tests the page using the specified HTTP method', function() {
			assert.isArray(pa11yResponse.json);

			const noticeH2522 = pa11yResponse.json.filter(response => response.code === 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2');
			assert.lengthEquals(noticeH2522, 1);
			assert.strictEqual(noticeH2522[0].context, '<title>foo=bar&amp;bar=baz</title>');
		});

	});

	describe('when the configuration specifies ignore rules', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/warnings`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--config', './mock/config/ignore-warnings.json',
					'--reporter', 'json'
				]
			});
		});

		it('ignores the specified issues', function() {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 0);
		});

	});

	describe('when no configuration is specified but a `pa11y.json` file exists in the working directory', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--reporter', 'json'
				],
				workingDirectory: path.join(__dirname, '..', 'mock', 'config')
			});
		});

		it('loads the default config', function() {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 0);
		});

	});

	describe('when the specified configuration file does not exist', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/notices`, {
				arguments: [
					'--config', './mock/config/does-not-exist.json'
				]
			});
		});

		it('exits with a code of `1`', function() {
			assert.strictEqual(pa11yResponse.exitCode, 1);
		});

		it('outputs an error saying the config file could not be found', function() {
			assert.include(pa11yResponse.stderr, 'Config file "./mock/config/does-not-exist.json" could not be found');
		});

	});

	describe('when the specified configuration file cannot be loaded', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/notices`, {
				arguments: [
					'--config', './mock/config/requires-missing-module.js'
				]
			});
		});

		it('exits with a code of `1`', function() {
			assert.strictEqual(pa11yResponse.exitCode, 1);
		});

		it('outputs an error saying the config file could not be loaded', function() {
			assert.include(pa11yResponse.stderr, 'Config file "./mock/config/requires-missing-module.js" could not be loaded');
		});

		it('outputs the reason it could not be loaded', function() {
			assert.include(pa11yResponse.stderr, 'pa11y-config-dependency-that-is-not-installed');
		});

	});

	describe('when the specified configuration file exists', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/notices`, {
				arguments: [
					'--config', './mock/config/pa11y.json'
				]
			});
		});

		it('outputs the path of the loaded config file', function() {
			const configPath = path.join(__dirname, '..', 'mock', 'config', 'pa11y.json');
			assert.include(pa11yResponse.stdout, `Loading config file: ${configPath}`);
		});

	});

	describe('when the configuration selects the JSON reporter', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--config', './mock/config/reporter-json.json'
				]
			});
		});

		it('outputs JSON that parses cleanly', function() {
			const json = JSON.parse(pa11yResponse.stdout);
			assert.isArray(json);
		});

	});

});

'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI reporter Markdown', function() {
	let pa11yResponse;

	describe('when the `--reporter` flag is set to "md"', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--reporter', 'md'
				]
			});
		});

		it('outputs issues in Markdown format', function() {
			assert.include(pa11yResponse.stdout,
				`# Accessibility Report For "${global.mockWebsiteAddress}/errors"`);
			assert.match(pa11yResponse.stdout, /| 🔴 Error {4}| 1 {3}|/);
			assert.match(pa11yResponse.stdout, /### 🔴 Error/);
		});

	});

	describe('when the `reporter` config is set to "md"', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--config', './mock/config/reporter-md.json'
				]
			});
		});

		it('outputs issues in Markdown format', function() {
			assert.include(pa11yResponse.stdout,
				`# Accessibility Report For "${global.mockWebsiteAddress}/errors"`);
			assert.match(pa11yResponse.stdout, /| 🔴 Error {4}| 1 {3}|/);
			assert.match(pa11yResponse.stdout, /### 🔴 Error/);
		});

	});

});

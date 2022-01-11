'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI reporter JSON', function() {
	let pa11yResponse;

	describe('when the `--reporter` flag is set to "json"', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--reporter', 'json'
				]
			});
		});

		it('outputs issues in JSON format', function() {
			const json = JSON.parse(pa11yResponse.stdout);
			assert.isArray(json);
			assert.lengthEquals(json, 1);
		});

	});

	describe('when the `reporter` config is set to "json"', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--config', './mock/config/reporter-json.json'
				]
			});
		});

		it('outputs issues in JSON format', function() {
			const json = JSON.parse(pa11yResponse.stdout);
			assert.isArray(json);
			assert.lengthEquals(json, 1);
		});

	});

});

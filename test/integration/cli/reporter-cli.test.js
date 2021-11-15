'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI reporter CLI', function() {
	let pa11yResponse;

	describe('when the `--reporter` flag is set to "cli"', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--reporter', 'cli'
				]
			});
		});

		it('outputs issues to CLI', function() {
			assert.match(pa11yResponse.stdout, /^Results for URL: .*\/errors$/im);
			assert.match(pa11yResponse.stdout, /^.*Error: .*$/im);
			assert.match(pa11yResponse.stdout, /^1 Errors$/im);
		});

	});

	describe('when the `reporter` config is set to "cli"', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--config', './mock/config/reporter-cli.json'
				]
			});
		});

		it('outputs issues to CLI', function() {
			assert.match(pa11yResponse.stdout, /^Results for URL: .*\/errors$/im);
			assert.match(pa11yResponse.stdout, /^.*Error: .*$/im);
			assert.match(pa11yResponse.stdout, /^1 Errors$/im);
		});

	});

});

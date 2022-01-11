'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI action "click-element"', function() {
	let pa11yResponse;

	describe('when the clicked element exists', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/actions-click-element`, {
				arguments: [
					'--config', './mock/config/actions-click-element.json',
					'--reporter', 'json'
				]
			});
		});

		// The test file ../mock/html/actions-click-element.html which we test here has an a11y
		// error in the markup. When this action is performed the DOM is manupulated by JavaScript
		// to remove the offending element, hence no a11y errors is proof of this successful action
		it('clicks the element before running tests', function() {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 0);
		});

	});

	describe('when the clicked element does not exist', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--config', './mock/config/actions-click-element.json'
				]
			});
		});

		it('exits with a code of `1`', function() {
			assert.strictEqual(pa11yResponse.exitCode, 1);
		});

		it('outputs an error', function() {
			assert.match(pa11yResponse.output, /failed action/i);
			assert.match(pa11yResponse.output, /no element matching selector "#clicker"/i);
		});

	});

});

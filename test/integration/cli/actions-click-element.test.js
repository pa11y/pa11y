'use strict';

const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI action "click-element"', () => {
	let pa11yResponse;

	describe('when the clicked element exists', () => {

		beforeAll(async () => {
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
		it('clicks the element before running tests', () => {
			expect(pa11yResponse.json).toHaveLength(0);
		});

	});

	describe('when the clicked element does not exist', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--config', './mock/config/actions-click-element.json'
				]
			});
		});

		it('exits with a code of `1`', () => {
			expect(pa11yResponse.exitCode).toEqual(1);
		});

		it('outputs an error', () => {
			expect(pa11yResponse.output).toMatch(/failed action/i);
			expect(pa11yResponse.output).toMatch(/no element matching selector "#clicker"/i);
		});

	});

});

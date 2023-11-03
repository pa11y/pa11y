'use strict';

const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI action "wait-for-element-event"', () => {
	let pa11yResponse;

	describe('when the target element exists', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/actions-wait-for-element-event`, {
				arguments: [
					'--config', './mock/config/actions-wait-for-element-event.json',
					'--reporter', 'json'
				]
			});
		});

		// The test file ../mock/html/actions-wait-for-element-event.html which we test here has an
		// a11y error in the markup. When this action is performed the DOM is manupulated by JavaScript
		// to remove the offending element, hence no a11y errors is proof of this successful action
		it('waits for the element to emit the event before running tests', () => {
			expect(pa11yResponse.exitCode).toEqual(0);
			expect(pa11yResponse.json).toHaveLength(0);
		});

	});

	describe('when the target element does not exist', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--config', './mock/config/actions-wait-for-element-event.json'
				]
			});
		});

		it('exits with a code of `1`', () => {
			expect(pa11yResponse.exitCode).toEqual(1);
		});

		it('outputs an error', () => {
			expect(pa11yResponse.output).toMatch(/failed action/i);
			expect(pa11yResponse.output).toMatch(/no element matching selector "#event-target"/i);
		});

	});

});

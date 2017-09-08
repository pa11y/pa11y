'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI action "wait-for-element-state"', () => {
	let pa11yResponse;

	describe('when waiting for an element to be added', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/actions-wait-for-element-state-added`, {
				arguments: [
					'--config', './mock/config/actions-wait-for-element-state-added.json',
					'--reporter', 'json'
				]
			});
		});

		// The test file ../mock/html/actions-wait-for-element-state-added.html which we test here
		// has an a11y error in the markup. When this action is performed the DOM is manupulated by
		// JavaScript to remove the offending element and add the expected element, hence no a11y
		// errors is proof of this successful action
		it('waits for the element to be added before running tests', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 0);
		});

	});

	describe('when waiting for an element to be removed', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/actions-wait-for-element-state-removed`, {
				arguments: [
					'--config', './mock/config/actions-wait-for-element-state-removed.json',
					'--reporter', 'json'
				]
			});
		});

		// The test file ../mock/html/actions-wait-for-element-state-removed.html which we test here
		// has an a11y error in the markup. When this action is performed the DOM is manupulated by
		// JavaScript to remove the offending element and remove the expected element, hence no a11y
		// errors is proof of this successful action
		it('waits for the element to be removed before running tests', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 0);
		});

	});

	describe('when waiting for an element to be visible', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/actions-wait-for-element-state-visible`, {
				arguments: [
					'--config', './mock/config/actions-wait-for-element-state-visible.json',
					'--reporter', 'json'
				]
			});
		});

		// The test file ../mock/html/actions-wait-for-element-state-visible.html which we test here
		// has an a11y error in the markup. When this action is performed the DOM is manupulated by
		// JavaScript to remove the offending element and make the expected element visible, hence
		// no a11y errors is proof of this successful action
		it('waits for the element to be visible before running tests', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 0);
		});

	});

	describe('when waiting for an element to be hidden', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/actions-wait-for-element-state-hidden`, {
				arguments: [
					'--config', './mock/config/actions-wait-for-element-state-hidden.json',
					'--reporter', 'json'
				]
			});
		});

		// The test file ../mock/html/actions-wait-for-element-state-hidden.html which we test here
		// has an a11y error in the markup. When this action is performed the DOM is manupulated by
		// JavaScript to remove the offending element and hide the expected element, hence no a11y
		// errors is proof of this successful action
		it('waits for the element to be hidden before running tests', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 0);
		});

	});

});

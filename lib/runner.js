'use strict';

const path = require('path');
const axePath = path.dirname(require.resolve('axe-core'));

const runner = module.exports = {};

/**
 * The Pa11y versions supported by this runner.
 * @public
 * @type {Array}
 */
runner.supports = '^5.0.0';

/**
 * Scripts which the test runner depends on.
 * @public
 * @type {Array}
 */
runner.scripts = [
	`${axePath}/axe.min.js`
];

/**
 * Run the test runner.
 * @public
 * @param {Object} options - A set of options to run the tests with.
 * @param {Object} pa11y - The Pa11y object, including helper methods.
 * @returns {Promise} Returns a promise which resolves with aXe issues.
 */
runner.run = async () => {

	// Configure and run aXe
	const results = await runAxeCore();
	return results;

	/**
	 * Run aXe on the current page.
	 * @private
	 * @returns {Promise} Returns a promise which resolves with aXe issues.
	 */
	async function runAxeCore() {
		const result = await window.axe.run();
		return [].concat(
			result.violations.map(processViolation),
			result.incomplete.map(processIncomplete)
		);
	}

	/**
	 * Process an aXe issue with type of "violation".
	 * @private
	 * @param {Object} issue - An aXe issue to process.
	 * @returns {Object} Returns the processed issue.
	 */
	function processViolation(issue) {
		issue.type = 'error';
		return processIssue(issue);
	}

	/**
	 * Process an aXe issue with type of "incomplete".
	 * @private
	 * @param {Object} issue - An aXe issue to process.
	 * @returns {Object} Returns the processed issue.
	 */
	function processIncomplete(issue) {
		issue.type = 'warning';
		return processIssue(issue);
	}

	/**
	 * Process an aXe issue.
	 * @private
	 * @param {Object} issue - An aXe issue to process.
	 * @returns {Object} Returns the processed issue.
	 */
	function processIssue(issue) {

		// For now we just select the first element. This needs testing
		const selector = issue.nodes.map(node => selectorToString(node.target)).join(', ');
		const element = (issue.nodes.length ? window.document.querySelector(selector) : null);

		return {
			code: issue.id,
			message: `${issue.help} (${issue.helpUrl})`,
			type: issue.type,
			element,
			runnerExtras: {
				description: issue.description,
				impact: issue.impact,
				help: issue.help,
				helpUrl: issue.helpUrl
			}
		};
	}

	/**
	 * Convert an aXe selector array to a selector string. Copied from
	 * https://github.com/dequelabs/axe-cli/blob/develop/lib/utils.js
	 * for now, wonder if we can share or move out.
	 * @private
	 * @param {Array} selectors - The selector parts.
	 * @returns {String} Returns the selector string.
	 */
	function selectorToString(selectors) {
		return selectors
			.reduce((selectorParts, selector) => selectorParts.concat(selector), [])
			.join(' ');
	}

};

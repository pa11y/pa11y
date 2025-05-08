'use strict';

const path = require('path');
const axePath = path.dirname(require.resolve('axe-core'));

const runner = module.exports = {};

/**
 * The Pa11y versions supported by this runner.
 * @public
 * @type {Array}
 */
runner.supports = '^9.0.0 || ^9.0.0-alpha || ^9.0.0-beta';

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
runner.run = async options => {

	// Configure and run aXe
	const results = await runAxeCore();
	return results;

	/**
	 * Run aXe on the current page.
	 * @private
	 * @returns {Promise} Returns a promise which resolves with aXe issues.
	 */
	async function runAxeCore() {
		const result = await window.axe.run(
			getAxeContext(),
			getAxeOptions()
		);
		return [].concat(
			...result.violations.map(processViolation),
			...result.incomplete.map(processIncomplete)
		);
	}

	/**
	 * Get the proper context to pass to aXe, according to the specified Pa11y options. It can be an
	 * HTML element or a CSS selector, ready to be used in axe.run().
	 * @private
	 * @returns {Node | string} Returns a context element
	 */
	function getAxeContext() {
		return options.rootElement || window.document;
	}

	/**
	 * Get the proper options to pass to aXe, according to the specified Pa11y options, ready to be
	 * used in axe.run().
	 * @private
	 * @returns {RunOptions} Returns a configuration object.
	 */
	function getAxeOptions() {
		const axeOptions = {};

		if (options.standard) {
			axeOptions.runOnly = pa11yStandardToAxe();
		}

		axeOptions.rules = pa11yRulesToAxe(
			Array.isArray(options.rules) ? options.rules : [],
			Array.isArray(options.ignore) ? options.ignore : []
		);

		return axeOptions;
	}

	/**
	 * Map the Pa11y standard option to the aXe runOnly option.
	 * @private
	 * @returns {RunOnly} Returns the aXe runOnly value.
	 */
	function pa11yStandardToAxe() {
		switch (options.standard) {
			case 'WCAG2A':
				return {
					type: 'tags',
					values: ['wcag2a', 'wcag21a', 'best-practice']
				};
			case 'WCAG2AA':
			case 'WCAG2AAA':
			default:
				return {
					type: 'tags',
					values: ['wcag2a', 'wcag21a', 'wcag2aa', 'wcag21aa', 'best-practice']
				};
		}
	}

	/**
	 * Map the Pa11y rules option to the aXe rules option.
	 * @private
	 * @param {Array} rules - pa11y rules array
	 * @param {Array} ignore - pa11y ignore array
	 * @returns {Object} Returns the aXe rules value.
	 */
	function pa11yRulesToAxe(rules, ignore) {
		const axeRuleIds = window.axe.getRules().reduce((allRules, rule) => {
			allRules[rule.ruleId.toLowerCase()] = true;
			return allRules;
		}, {});

		const axeRules = {};

		// Filter the rules based on the axeRuleIds then enable/disable them
		rules.filter(rule => axeRuleIds[rule])
			.forEach(rule => (axeRules[rule] = {enabled: true}));
		ignore.filter(rule => axeRuleIds[rule])
			.forEach(rule => (axeRules[rule] = {enabled: false}));

		return axeRules;
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
	 * @returns {Object} Returns an array of processed issues.
	 */
	function processIncomplete(issue) {
		issue.type = 'warning';
		return processIssue(issue);
	}

	/**
	 * Process an aXe issue.
	 * @private
	 * @param {Object} axeIssue - An aXe issue to process.
	 * @returns {Object[]} Returns an array of processed issues.
	 */
	function processIssue(axeIssue) {
		// See https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#results-object for a description
		// of an axe issue

		let elements = [null];
		if (axeIssue.nodes.length) {
			const selectors = axeIssue.nodes.map(node => selectorToString(node.target));
			elements = selectors.map(selector => window.document.querySelector(selector));
		}

		return elements.map(element => ({
			type: axeImpactToPa11yLevel(axeIssue.impact),
			code: axeIssue.id,
			message: `${axeIssue.help} (${axeIssue.helpUrl})`,
			element,
			runnerExtras: {
				description: axeIssue.description,
				impact: axeIssue.impact,
				help: axeIssue.help,
				helpUrl: axeIssue.helpUrl
			}
		}));
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


	/**
	 * Convert a axe violation impact to a pa11y level
	 * @private
	 * @param {string} impact axe level
	 * @returns {string} pa11y level
	 */
	function axeImpactToPa11yLevel(impact) {
		switch (impact) {
			case 'critical':
			case 'serious':
				return 'error';
			case 'moderate':
				return 'warning';
			case 'minor':
				return 'notice';
			default:
				return 'error';
		}
	}

};

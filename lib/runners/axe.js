'use strict';

const path = require('path');
const axePath = path.dirname(require.resolve('axe-core'));


/**
 * Axe's types
 * @typedef { import('axe-core') } Axe
 * @typedef { import('axe-core').Selector } AxeSelector
 * @typedef { import('axe-core').Rule } AxeRule
 * @typedef { import('axe-core').ImpactValue } AxeImpact
 * @typedef { import('axe-core').Result } AxeResult
 * @typedef { import('axe-core').RunOptions } AxeRunOptions
 * @typedef { import('axe-core').RunOnly } AxeRunOnly
 */

/**
 * @import { Pa11yConfiguration, Pa11yStandard, Pa11yLevel } from '../pa11y'
 */

const run = async options => {

	/**
	 * @returns {Axe} Axe
	 */
	const getBrowserAxe = () => (window || global).axe;

	/**
	 * Get the proper context to pass to axe, according to the specified Pa11y options. It can be an
	 * HTML element or a CSS selector, ready to be used in `axe.run()`
	 * @param {Node | string} rootElement Root element
	 * @returns {Node | string} Axe context element
	 */
	function getAxeContext(rootElement) {
		return rootElement || window.document;
	}

	/**
	 * Create a configuration for `axe.run()` corresponding to Pa11y's current configuration
	 * @param {Pa11yConfiguration} options Pa11y's configuration
	 * @returns {AxeRunOptions} Axe configuration
	 */
	const getAxeOptions = ({standard, rules = [], ignore = []}) => ({
		rules: pa11yRulesToAxe(rules, ignore),
		...(standard && {
			runOnly: createAxeRunOnlyTags(standard)
		})
	});

	/**
	 * Convert an axe selector array to a selector string.
	 * @param {Array<string>} selectors - The selector parts.
	 * @returns {string} Selector string.
	 */
	const selectorToString = selectors => selectors.join(' ');

	/**
	 * Map Pa11y's 'standard' to axe's 'runOnly'.
	 * @param {Pa11yStandard} pa11yStandard Provided Pa11y standard (upper bound)
	 * @returns {AxeRunOnly} Axe's `runOnly` value.
	 */
	const createAxeRunOnlyTags = pa11yStandard => ({
		type: 'tags',
		values: [
			'wcag2a',
			'wcag21a',
			...(pa11yStandard === 'WCAG2A' ? [] : [
				'wcag2aa',
				'wcag21aa'
			]),
			'best-practice'
		]
	});

	/**
	 * Map the Pa11y rules option to the axe rules option
	 * @param {Array<string>} rules List of Pa11y rules
	 * @param {Array<string>} ignore List of Pa11y rules to ignore
	 * @returns {object} Axe rules value
	 */
	const pa11yRulesToAxe = (rules, ignore) => {
		return Object.assign(
			{},
			...getBrowserAxe()
				.getRules()
				.map(({ruleId}) => ruleId.toLowerCase())
				.map(id => createAxeRule(id, rules, ignore))
				.filter(rule => rule)
		);
	};

	const createAxeRule = (axeId, pa11yRules, pa11yIgnore) => {
		if (pa11yRules.includes(axeId)) {
			return ({
				[axeId]: {
					enabled: true
				}
			});
		}
		if (pa11yIgnore.includes(axeId)) {
			return ({
				[axeId]: {
					enabled: false
				}
			});
		}
		return null;
	};

	const axeImpactToPa11yLevel = {
		critical: 'error',
		serious: 'error',
		moderate: 'warning',
		minor: 'notice'
	};

	const pa11yLevelSeverity = {
		error: 3,
		warning: 2,
		notice: 1
	};

	const isWithinMaxLevel = (level, maxLevel) => {
		return pa11yLevelSeverity[level] <= pa11yLevelSeverity[maxLevel];
	};

	/**
	 * Choose a Pa11y reporting level corresponding to an axe issue
	 * @param {AxeImpact} axeImpact Axe's reported impact level
	 * @param {boolean} issueNeedsReview Whether the issue needs further review
	 * @param {string} levelCapWhenNeedsReview Cap incomplete issue level: error, warning, notice
	 * @returns {Pa11yLevel} A Pa11y level
	 */
	const choosePa11yLevel = (axeImpact, issueNeedsReview, levelCapWhenNeedsReview) => {
		let level = axeImpactToPa11yLevel?.[axeImpact] ?? 'error';
		if (issueNeedsReview && levelCapWhenNeedsReview && !isWithinMaxLevel(
			level,
			levelCapWhenNeedsReview
		)) {
			level = levelCapWhenNeedsReview;
		}
		return level;
	};

	/**
	 * Process an axe issue.
	 * @param {AxeResult} axeIssue The axe issue
	 * @param {boolean} needsFurtherReview This axe issue is incomplete and may need review.
	 * @param {string} levelCapWhenNeedsReview Cap incomplete issue level: error, warning, notice
	 * @returns {object[]} List of processed issues
	 * @see https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#results-object
	 */
	const processIssue = (
		{nodes, id, description, help, helpUrl, impact},
		needsFurtherReview = false,
		levelCapWhenNeedsReview
	) => {
		return (nodes.length ? nodes : nodesForNodelessIssue())
			.map(({target}) => target && selectorToString(target))
			.map(selector => selector && window.document.querySelector(selector))
			.map(element => ({
				element,
				code: id,
				type: choosePa11yLevel(impact, needsFurtherReview, levelCapWhenNeedsReview),
				message: `${help} (${helpUrl})`,
				runnerExtras: {
					description,
					impact,
					needsFurtherReview,
					help,
					helpUrl
				}
			}));
	};

	const nodesForNodelessIssue = () => [{
		target: null
	}];

	/**
	 * Run axe on the page
	 * @param {Pa11yConfiguration} options Pa11y's configuration
	 * @returns {Promise<Array<Pa11yResult>>} A promise of axe issues translated for Pa11y
	 */
	async function runAxeCore({standard, rules, ignore, rootElement, levelCapWhenNeedsReview}) {
		const {
			violations = [],
			incomplete = []
		} =
			await getBrowserAxe()
				.run(
					getAxeContext(rootElement),
					getAxeOptions({
						standard,
						rules,
						ignore
					})
				);

		return [
			...violations.flatMap(issue => processIssue(issue, false, levelCapWhenNeedsReview)),
			...incomplete.flatMap(issue => processIssue(issue, true, levelCapWhenNeedsReview))
		];
	}

	return await runAxeCore(options);
};

/**
 * Pa11y runner for axe.
 * @type {import('../pa11y').Pa11yRunner}
 * @see https://www.deque.com/axe/core-documentation/api-documentation/
 */
const runner = {
	run,
	scripts: [`${axePath}/axe.min.js`],
	supports: '^9.0.0 || ^9.0.0-alpha || ^9.0.0-beta'
};

/**
 * Export for CommonJS.
 * For browsers, runners are currently stringified and inserted directly.
 */
module.exports = runner;

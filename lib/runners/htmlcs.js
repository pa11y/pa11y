'use strict';

const runner = module.exports = {};

/**
 * The Pa11y versions supported by this runner.
 * @public
 * @type {Array}
 */
runner.supports = '^6.0.0 || ^6.0.0-alpha || ^6.0.0-beta';

/**
 * Scripts which the test runner depends on.
 * @public
 * @type {Array}
 */
runner.scripts = [
	require.resolve('html_codesniffer/build/HTMLCS.js')
];

/**
 * Run the test runner.
 * @public
 * @param {Object} options - A set of options to run the tests with.
 * @param {Object} pa11y - The Pa11y object, including helper methods.
 * @returns {Promise} Returns a promise which resolves with HTML CodeSniffer issues.
 */
runner.run = async options => {

	/**
	 * A map of issue type codes to names.
	 * @private
	 */
	const issueTypeMap = {
		1: 'error',
		2: 'warning',
		3: 'notice'
	};

	// Configure and run HTML CodeSniffer
	configureHtmlCodeSniffer();
	const results = await runHtmlCodeSniffer();
	return results;

	/**
	 * Configure HTML CodeSniffer.
	 * @private
	 * @returns {void} Returns nothing.
	 */
	function configureHtmlCodeSniffer() {
		if (!options.rules.length || options.standard === 'Section508') {
			return;
		}

		for (const rule of options.rules) {
			if (window.HTMLCS_WCAG2AAA.sniffs.includes(rule)) {
				window[`HTMLCS_${options.standard}`].sniffs[0].include.push(rule);
			} else {
				throw new Error(`${rule} is not a valid WCAG 2.1 rule`);
			}
		}
	}

	/**
	 * Run HTML CodeSniffer on the current page.
	 * @private
	 * @returns {Promise} Returns a promise which resolves with HTML CodeSniffer issues.
	 */
	function runHtmlCodeSniffer() {
		return new Promise((resolve, reject) => {
			const runCodeSniffer = htmlcs => {
				htmlcs.process(options.standard, window.document, error => {
					if (error) {
						return reject(error);
					}
					resolve(htmlcs.getMessages().map(processIssue));
				});
			};

			// If the site that this is being run on used AMD modules, as HTML_CS will define
			// an AMD module if so.
			if (typeof window.define === 'function' &&
				// eslint-disable-next-line no-undef
				window.define.amd &&
				typeof window.require === 'function') {

				window.require(['htmlcs'], htmlcs => {
					// HTML_CS incorrectly handles it's global so we have to fudge it by adding all
					// the properties it expects onto the window.
					Object.keys(htmlcs).forEach(key => {
						window[key] = htmlcs[key];
					});

					runCodeSniffer(htmlcs.HTMLCS);
				});
			} else {
				runCodeSniffer(window.HTMLCS);
			}
		});
	}

	/**
	 * Process an HTML CodeSniffer issue.
	 * @private
	 * @param {Object} issue - An HTML CodeSniffer issue to process.
	 * @returns {Object} Returns the processed issue.
	 */
	function processIssue(issue) {
		return {
			code: issue.code,
			message: issue.msg,
			type: issueTypeMap[issue.type] || 'unknown',
			element: issue.element
		};
	}

};

/* eslint strict: ["error", "function"] */

((exporter => {
	'use strict';

	const pa11y = {
		getElementContext,
		getElementSelector,
		run: runPa11y,
		runners: {}
	};

	// Create the global Pa11y variable
	/* eslint-disable-next-line no-underscore-dangle */
	exporter.__pa11y = pa11y;

	/**
	 * A map of issue names to type codes.
	 * @private
	 */
	const issueCodeMap = {
		unknown: 0,
		error: 1,
		warning: 2,
		notice: 3
	};

	/**
	 * Run Pa11y on the current page, using any other runners defined.
	 * @public
	 * @param {import("./pa11y").Pa11yConfiguration} options Options to use when running tests.
	 * @returns {Promise} Returns a promise which resolves with test results.
	 */
	async function runPa11y(options) {
		pa11y.version = options.pa11yVersion;

		await wait(options.wait);

		// Set up the result object
		const result = {
			documentTitle: window.document.title || '',
			pageUrl: window.location.href || '',
			issues: []
		};

		// Execute all of the runners and process issues
		for (const runner of options.runners) {
			const runnerIssues = await pa11y.runners[runner](options, pa11y);
			runnerIssues.map(issue => {
				issue.runner = runner;
				return issue;
			});
			result.issues = result.issues.concat(runnerIssues);
		}
		result.issues = processIssues(result.issues);

		// Return the result object
		return result;

		/**
		 * Process issues from a runner.
		 * @param {Array<Pa11yIssue>} issues An array of issues to process.
		 * @returns {Array<Pa11yIssue>} Returns an array of processed issues.
		 */
		function processIssues(issues) {
			if (options.rootElement) {
				issues = issues.filter(issue => isElementInTestArea(issue.element));
			}
			if (options.hideElements) {
				issues = issues.filter(issue => isElementOutsideHiddenArea(issue.element));
			}
			return issues.map(processIssue).filter(isIssueNotIgnored);
		}

		/**
		 * Process a runner issue
		 * @private
		 * @param {Pa11yIssue} issue An unrefined Pa11y runner issue
		 * @returns {Pa11yIssue} The completed issue
		 */
		function processIssue(issue) {
			return {
				code: issue.code,
				type: issue.type,
				typeCode: issueCodeMap[issue.type] || 0,
				message: issue.message,
				context: (issue.element ? getElementContext(issue.element) : ''),
				selector: (issue.element ? getElementSelector(issue.element) : ''),
				runner: issue.runner,
				runnerExtras: issue.runnerExtras || {}
			};
		}

		/**
		 * Confirms the issue isn't being ignored.
		 * @param {Pa11yIssue} issue Some issue.
		 * @returns {boolean} Whether the issue should be included.
		 */
		function isIssueNotIgnored(issue) {
			if (options.ignore.indexOf(issue.code.toLowerCase()) !== -1) {
				return false;
			}
			if (options.ignore.indexOf(issue.type) !== -1) {
				return false;
			}
			return true;
		}

		/**
		 * Check whether an element is in the test area specified by rootElement.
		 * @private
		 * @param {HTMLElement} element Some element.
		 * @returns {boolean} Whether the element is in the test area.
		 */
		function isElementInTestArea(element) {
			const rootElement = window.document.querySelector(options.rootElement);
			return (rootElement ? rootElement.contains(element) : true);
		}

		/**
		 * Check whether an element is outside of all hidden selectors.
		 * @private
		 * @param {HTMLElement} element Some element.
		 * @returns {boolean} Whether the element is outside of a hidden area.
		 */
		function isElementOutsideHiddenArea(element) {
			const hiddenElements = [...window.document.querySelectorAll(options.hideElements)];
			return !hiddenElements.some(hiddenElement => {
				return hiddenElement.contains(element);
			});
		}

	}

	/**
	 * Wait for some time.
	 * @param {number} milliseconds Number of milliseconds to wait.
	 * @returns {Promise<void>} A promise to continue after some time passes.
	 */
	function wait(milliseconds) {
		return new Promise(resolve => {
			setTimeout(resolve, milliseconds);
		});
	}

	/**
	 * Get a short version of an element's outer HTML.
	 * @param {HTMLElement} element Some element.
	 * @returns {string} Shortened HTML as string.
	 */
	function getElementContext(element) {
		let outerHTML = null;
		let innerHTML = null;
		if (!element.outerHTML) {
			return outerHTML;
		}
		outerHTML = element.outerHTML;
		if (element.innerHTML.length > 31) {
			innerHTML = `${element.innerHTML.substr(0, 31)}...`;
			outerHTML = outerHTML.replace(element.innerHTML, innerHTML);
		}
		if (outerHTML.length > 251) {
			outerHTML = `${outerHTML.substr(0, 250)}...`;
		}
		return outerHTML;
	}

	/**
	 * Get a CSS selector for an element.
	 * @param {HTMLElement} element - An element to get a selector for.
	 * @param {Array} [selectorParts=[]] - Internal parameter used for recursion.
	 * @returns {String} Returns the CSS selector as a string.
	 */
	function getElementSelector(element, selectorParts = []) {
		if (isElementNode(element)) {
			const identifier = buildElementIdentifier(element);
			selectorParts.unshift(identifier);
			if (!element.id && element.parentNode) {
				return getElementSelector(element.parentNode, selectorParts);
			}
		}
		return selectorParts.join(' > ');
	}

	/**
	 * Build a unique CSS element identifier.
	 * @param {HTMLElement} element - An element to get a CSS element identifier for.
	 * @returns {string} CSS element identifier
	 */
	function buildElementIdentifier(element) {
		if (element.id) {
			return `#${element.id}`;
		}
		let identifier = element.tagName.toLowerCase();
		if (!element.parentNode) {
			return identifier;
		}
		const siblings = getSiblings(element);
		const childIndex = siblings.indexOf(element);
		if (!isOnlySiblingOfType(element, siblings) && childIndex !== -1) {
			identifier += `:nth-child(${childIndex + 1})`;
		}
		return identifier;
	}

	/**
	 * Get element siblings.
	 * @param {HTMLElement} element Some element.
	 * @returns {Array<HTMLElement} Array of siblings.
	 */
	function getSiblings(element) {
		return [...element.parentNode.childNodes].filter(isElementNode);
	}

	/**
	 * Check whether an element is the only sibling of its type.
	 * @param {HTMLElement} element Some element.
	 * @param {Array<HTMLElement} siblings Siblings of this element.
	 * @returns {boolean} Whether the element is the only sibling of its type.
	 */
	function isOnlySiblingOfType(element, siblings) {
		const siblingsOfType = siblings.filter(sibling => {
			return (sibling.tagName === element.tagName);
		});
		return (siblingsOfType.length <= 1);
	}

	/**
	 * Check whether a node is an element.
	 * @param {Node} node Some DOM node.
	 * @returns {boolean} Returns whether the element is an HTMLElement.
	 */
	function isElementNode(element) {
		return (element.nodeType === window.Node.ELEMENT_NODE);
	}
})(this));

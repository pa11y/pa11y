/* eslint strict: ["warn", "function"] */
// IIFE is here so we don't pollute the window
((exports => {
	'use strict';

	/* eslint-disable no-underscore-dangle */
	exports._runPa11y = runPa11y;
	/* eslint-enable no-underscore-dangle */

	/**
	 * A map of issue type codes to names.
	 * @private
	 */
	const issueTypeMap = {
		1: 'error',
		2: 'warning',
		3: 'notice'
	};

	/**
	 * Run Pa11y on the current page.
	 * @public
	 * @param {Object} options - Options to use when running tests.
	 * @returns {Promise} Returns a promise which resolves with test results.
	 */
	async function runPa11y(options) {
		await wait(options.wait);

		// Load and process the issues
		configureHtmlCodeSniffer();
		return {
			documentTitle: window.document.title || '',
			pageUrl: window.location.href || '',
			issues: processIssues(await runHtmlCodeSniffer())
		};

		/**
		 * Wait for a number of milliseconds.
		 * @private
		 * @param {Number} milliseconds - The number of milliseconds to wait for.
		 * @returns {Promise} Returns a promise which resolves in a number of milliseconds.
		 */
		function wait(milliseconds) {
			return new Promise(resolve => {
				setTimeout(resolve, milliseconds);
			});
		}

		/**
		 * Configure HTML CodeSniffer.
		 * @private
		 * @returns {Undefined} Returns nothing.
		 */
		function configureHtmlCodeSniffer() {
			if (options.rules.length && options.standard !== 'Section508') {
				for (const rule of options.rules) {
					if (window.HTMLCS_WCAG2AAA.sniffs.includes(rule)) {
						window[`HTMLCS_${options.standard}`].sniffs[0].include.push(rule);
					} else {
						throw new Error(`${rule} is not a valid WCAG 2.0 rule`);
					}
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
				window.HTMLCS.process(options.standard, window.document, error => {
					if (error) {
						return reject(error);
					}
					resolve(window.HTMLCS.getMessages());
				});
			});
		}

		/**
		 * Process HTML CodeSniffer issues.
		 * @private
		 * @param {Array} issues - An array of HTML CodeSniffer issues to process.
		 * @returns {Array} Returns an array of processed issues.
		 */
		function processIssues(issues) {
			if (options.rootElement) {
				issues = issues.filter(isIssueInTestArea);
			}
			if (options.hideElements) {
				issues = issues.filter(isElementOutsideHiddenArea);
			}
			return issues.map(processIssue).filter(isIssueNotIgnored);
		}

		/**
		 * Process a HTML CodeSniffer issue.
		 * @private
		 * @param {Object} issue - An HTML CodeSniffer issue to process.
		 * @returns {Object} Returns the processed issue.
		 */
		function processIssue(issue) {
			return {
				code: issue.code,
				context: processIssueHtml(issue.element),
				message: issue.msg,
				type: issueTypeMap[issue.type] || 'unknown',
				typeCode: issue.type,
				selector: getCssSelectorForElement(issue.element)
			};
		}

		/**
		 * Get a short version of an element's outer HTML.
		 * @private
		 * @param {HTMLElement} element - An element to get short HTML for.
		 * @returns {String} Returns the short HTML as a string.
		 */
		function processIssueHtml(element) {
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
		 * @private
		 * @param {HTMLElement} element - An element to get a selector for.
		 * @param {Array} [selectorParts=[]] - Internal parameter used for recursion.
		 * @returns {String} Returns the CSS selector as a string.
		 */
		function getCssSelectorForElement(element, selectorParts = []) {
			if (isElementNode(element)) {
				const identifier = buildElementIdentifier(element);
				selectorParts.unshift(identifier);
				if (!element.id && element.parentNode) {
					return getCssSelectorForElement(element.parentNode, selectorParts);
				}
			}
			return selectorParts.join(' > ');
		}

		/**
		 * Build a unique CSS element identifier.
		 * @private
		 * @param {HTMLElement} element - An element to get a CSS element identifier for.
		 * @returns {String} Returns the CSS element identifier as a string.
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
		 * @private
		 * @param {HTMLElement} element - An element to get siblings for.
		 * @return {Array} Returns an array of siblings as HTMLElements.
		 */
		function getSiblings(element) {
			return [...element.parentNode.childNodes].filter(isElementNode);
		}

		/**
		 * Check whether an element is the only sibling of its type.
		 * @private
		 * @param {HTMLElement} element - An element to check siblings of.
		 * @param {Array} siblings - The siblings of the element.
		 * @returns {Boolean} Returns whether the element is the only sibling of its type.
		 */
		function isOnlySiblingOfType(element, siblings) {
			const siblingsOfType = siblings.filter(sibling => {
				return (sibling.tagName === element.tagName);
			});
			return (siblingsOfType.length <= 1);
		}

		/**
		 * Check whether an element is an element node.
		 * @private
		 * @param {Node} element - An element to check.
		 * @returns {Boolean} Returns whether the element is an element node.
		 */
		function isElementNode(element) {
			return (element.nodeType === window.Node.ELEMENT_NODE);
		}

		/**
		 * Check whether an issue should be returned, and is not ignored.
		 * @private
		 * @param {Object} issue - The issue to check.
		 * @returns {Boolean} Returns whether the issue should be returned.
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
		 * Check whether an issue is in the test area specified by rootElement.
		 * @private
		 * @param {Object} issue - The issue to check.
		 * @returns {Boolean} Returns whether the issue is in the test area.
		 */
		function isIssueInTestArea(issue) {
			const rootElement = window.document.querySelector(options.rootElement);
			return (rootElement ? rootElement.contains(issue.element) : true);
		}

		/**
		 * Check whether an element is outside of all hidden selectors.
		 * @private
		 * @param {Object} issue - The issue to check.
		 * @returns {Boolean} Returns whether the issue is outside of a hidden area.
		 */
		function isElementOutsideHiddenArea(issue) {
			const hiddenElements = [...window.document.querySelectorAll(options.hideElements)];
			return !hiddenElements.some(hiddenElement => {
				return hiddenElement.contains(issue.element);
			});
		}

	}

})(this));

/* eslint strict: ["error", "function"] */

((exporter => {
	'use strict';

	const pa11yRunner = {
		getElementContext,
		getElementSelector,
		run,
		runners: {},
		version: null
	};

	// Create the global Pa11y variable
	/* eslint-disable-next-line no-underscore-dangle */
	exporter.__pa11y = pa11yRunner;

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
	 * @import { Pa11yConfiguration } from './pa11y'
	 */
	/**
	 * Run Pa11y on the current page, using any other runners defined.
	 * @public
	 * @param {Pa11yConfiguration} options Options to use when running tests.
	 * @returns {Promise} Returns a promise which resolves with test results.
	 */
	async function run(options) {
		const {
			pa11yVersion,
			runners: runnerNames,
			wait: waitTime
		} = options;

		await wait(waitTime);
		pa11yRunner.version = pa11yVersion;

		const issuesPerRunner = await Promise.all(
			runnerNames.map(runnerGo)
		);

		return {
			documentTitle: window.document.title || '',
			pageUrl: window.location.href || '',
			issues: processIssues(issuesPerRunner.flat())
		};


		async function runnerGo(name) {
			const issues = await pa11yRunner.runners[name](options, pa11yRunner);
			return issues.map(issue => ({
				...issue,
				runner: name
			}));
		}

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
		function processIssue({code, type, message, element, runner, runnerExtras = {}}) {
			return {
				code,
				type,
				typeCode: issueCodeMap[type] || 0,
				message,
				context: (element ? getElementContext(element) : ''),
				selector: (element ? getElementSelector(element) : ''),
				runner,
				runnerExtras
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
			if (!rootElement) {
				return true;
			}
			return elementIsContained(rootElement, element);
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
				return elementIsContained(hiddenElement, element);
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
		const shortenOuterHTML = outerElement => {
			let outerHTML = null;
			if (!outerElement.outerHTML) {
				return outerHTML;
			}
			({outerHTML} = outerElement);
			if (outerElement.innerHTML.length > 31) {
				const innerHTML = `${outerElement.innerHTML.substr(0, 31)}...`;
				outerHTML = outerHTML.replace(outerElement.innerHTML, innerHTML);
			}
			if (outerHTML.length > 251) {
				outerHTML = `${outerHTML.substr(0, 250)}...`;
			}
			return outerHTML;
		};
		if (!getShadowRoot(element)) {
			return shortenOuterHTML(element);
		}
		const parts = [];
		let current = element;
		while (current && nodeIsElement(current)) {
			const html = shortenOuterHTML(current);
			if (html) {
				parts.unshift(html);
			}
			const root = getShadowRoot(current);
			if (!root) {
				break;
			}
			parts.unshift('#shadow-root');
			current = root.host;
		}
		return parts.join(' → ');
	}

	/**
	 * Get a CSS selector for an element.
	 * @param {HTMLElement} element - An element to get a selector for.
	 * @param {Array} [selectorParts=[]] - Internal parameter used for recursion.
	 * @returns {String} Returns the CSS selector as a string.
	 */
	function getElementSelector(element, selectorParts = []) {
		const joinSelectorParts = parts => {
			let selector = '';
			for (const part of parts) {
				if (!selector) {
					selector = part;
				} else if (part === '#shadow-root' || selector.endsWith('#shadow-root')) {
					selector += ` → ${part}`;
				} else {
					selector += ` > ${part}`;
				}
			}
			return selector;
		};
		const parentForSelector = current => {
			if (isShadowRoot(current.parentNode)) {
				return current.parentNode;
			}
			if (current.id) {
				return getShadowRoot(current);
			}
			return current.parentNode;
		};
		if (isShadowRoot(element)) {
			selectorParts.unshift('#shadow-root');
			return getElementSelector(element.host, selectorParts);
		}
		if (!nodeIsElement(element)) {
			return joinSelectorParts(selectorParts);
		}
		selectorParts.unshift(buildElementIdentifier(element));
		const parent = parentForSelector(element);
		if (parent) {
			return getElementSelector(parent, selectorParts);
		}
		return joinSelectorParts(selectorParts);
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
	 * @returns {Array<HTMLElement>} Array of siblings.
	 */
	function getSiblings(element) {
		return [...element.parentNode.childNodes].filter(nodeIsElement);
	}

	/**
	 * Check whether an element is the only sibling of its type.
	 * @param {HTMLElement} element Some element.
	 * @param {Array<HTMLElement>} siblings Siblings of this element.
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
	function nodeIsElement(node) {
		return Boolean(node && node.nodeType === window.Node.ELEMENT_NODE);
	}

	function isShadowRoot(node) {
		return Boolean(
			node &&
			node.host &&
			node.nodeType === window.Node.DOCUMENT_FRAGMENT_NODE
		);
	}

	function getShadowRoot(node) {
		while (node && node.parentNode) {
			node = node.parentNode;
		}
		return isShadowRoot(node) ? node : null;
	}

	function elementIsContained(ancestor, element) {
		const shadowHost = node => {
			if (typeof node.getRootNode !== 'function') {
				return null;
			}
			const root = node.getRootNode();
			if (!root || !root.host || root.host === node) {
				return null;
			}
			return root.host;
		};
		let current = element;
		const seen = new Set();
		while (current && !seen.has(current)) {
			seen.add(current);
			if (ancestor.contains(current)) {
				return true;
			}
			current = shadowHost(current);
		}
		return false;
	}
})(this));

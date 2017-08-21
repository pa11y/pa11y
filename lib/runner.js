// IIFE is here so we don't pollute the window
((exports => {

	/* eslint-disable no-underscore-dangle */
	exports._runPa11y = runPa11y;
	/* eslint-enable no-underscore-dangle */

	/**
	 * A map of message type codes to names.
	 * @private
	 */
	const messageTypeMap = {
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

		// Load and process the messages
		configureHtmlCodeSniffer();
		return {
			documentTitle: window.document.title || '',
			messages: processMessages(await runHtmlCodeSniffer())
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
		 * @returns {Promise} Returns a promise which resolves with HTML CodeSniffer messages.
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
		 * Process HTML CodeSniffer messages.
		 * @private
		 * @param {Array} messages - An array of HTML CodeSniffer messages to process.
		 * @returns {Array} Returns an array of processed messages.
		 */
		function processMessages(messages) {
			if (options.rootElement) {
				messages = messages.filter(isMessageInTestArea);
			}
			if (options.hideElements) {
				messages = messages.filter(isElementOutsideHiddenArea);
			}
			return messages.map(processMessage).filter(isMessageNotIgnored);
		}

		/**
		 * Process a HTML CodeSniffer message.
		 * @private
		 * @param {Object} message - An HTML CodeSniffer message to process.
		 * @returns {Object} Returns the processed message.
		 */
		function processMessage(message) {
			return {
				code: message.code,
				context: processMessageHtml(message.element),
				message: message.msg,
				type: messageTypeMap[message.type] || 'unknown',
				typeCode: message.type,
				selector: getCssSelectorForElement(message.element)
			};
		}

		/**
		 * Get a short version of an element's outer HTML.
		 * @private
		 * @param {HTMLElement} element - An element to get short HTML for.
		 * @returns {String} Returns the short HTML as a string.
		 */
		function processMessageHtml(element) {
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
		 * Check whether a message should be returned, and is not ignored.
		 * @private
		 * @param {Object} message - The message to check.
		 * @returns {Boolean} Returns whether the message should be returned.
		 */
		function isMessageNotIgnored(message) {
			if (options.ignore.indexOf(message.code.toLowerCase()) !== -1) {
				return false;
			}
			if (options.ignore.indexOf(message.type) !== -1) {
				return false;
			}
			return true;
		}

		/**
		 * Check whether a message is in the test area specified by rootElement.
		 * @private
		 * @param {Object} message - The message to check.
		 * @returns {Boolean} Returns whether the messages is in the test area.
		 */
		function isMessageInTestArea(message) {
			const rootElement = window.document.querySelector(options.rootElement);
			return (rootElement ? rootElement.contains(message.element) : true);
		}

		/**
		 * Check whether an element is outside of all hidden selectors.
		 * @private
		 * @param {Object} message - The message to check.
		 * @returns {Boolean} Returns whether the message is outside of a hidden area.
		 */
		function isElementOutsideHiddenArea(message) {
			const hiddenElements = [...window.document.querySelectorAll(options.hideElements)];
			return !hiddenElements.some(hiddenElement => {
				return hiddenElement.contains(message.element);
			});
		}

	}

})(typeof module !== 'undefined' && module.exports ? module.exports : window));

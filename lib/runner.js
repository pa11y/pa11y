// IIFE is here so we don't pollute the window
((exports => {

	exports._runPa11y = runPa11y;

	/**
	 * A map of message type codes to names.
	 * TODO: jsdoc
	 */
	const messageTypeMap = {
		1: 'error',
		2: 'warning',
		3: 'notice'
	};

	/**
	 * Run Pa11y on the current page.
	 * TODO: jsdoc
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
		 */
		function wait(milliseconds) {
			return new Promise(resolve => {
				setTimeout(resolve, milliseconds);
			});
		}

		/**
		 * Configure HTML CodeSniffer.
		 * TODO: jsdoc
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
		 * TODO: jsdoc
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
		 * TODO: jsdoc
		 */
		function processMessages(messages) {
			if (options.rootElement) {
				messages = messages.filter(isMessageInTestArea);
			}
			if (options.hideElements) {
				messages = messages.filter(isElementOutsideHiddenArea);
			}
			return messages.map(processMessage).filter(isMessageWanted);
		}

		/**
		 * Process a HTML CodeSniffer message.
		 * TODO: jsdoc
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
		 * TODO: jsdoc
		 */
		function processMessageHtml(element) {
			let outerHTML = null;
			let innerHTML = null;
			if (!element.outerHTML) {
				return outerHTML;
			}
			outerHTML = element.outerHTML;
			if (element.innerHTML.length > 31) {
				innerHTML = element.innerHTML.substr(0, 31) + '...';
				outerHTML = outerHTML.replace(element.innerHTML, innerHTML);
			}
			if (outerHTML.length > 251) {
				outerHTML = outerHTML.substr(0, 250) + '...';
			}
			return outerHTML;
		}

		/**
		 * Get a CSS selector for an element.
		 * TODO: jsdoc
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
		 * TODO: jsdoc
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
		 * TODO: jsdoc
		 */
		function getSiblings(element) {
			return [...element.parentNode.childNodes].filter(isElementNode);
		}

		/**
		 * Check whether an element is the only sibling of its type.
		 * TODO: jsdoc
		 */
		function isOnlySiblingOfType(element, siblings) {
			const siblingsOfType = siblings.filter(sibling => {
				return (sibling.tagName === element.tagName);
			});
			return (siblingsOfType.length <= 1);
		}

		/**
		 * Check whether an element is an element node.
		 * TODO: jsdoc
		 */
		function isElementNode(element) {
			return (element.nodeType === Node.ELEMENT_NODE);
		}

		/**
		 * Check whether a message should be returned.
		 * TODO: jsdoc
		 */
		function isMessageWanted(message) {
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
		 * TODO: jsdoc
		 */
		function isMessageInTestArea(message) {
			const rootElement = window.document.querySelector(options.rootElement);
			return (rootElement ? rootElement.contains(message.element) : true);
		}

		/**
		 * Check whether an element is outside of all hidden selectors.
		 * TODO: jsdoc
		 */
		function isElementOutsideHiddenArea(message) {
			const hiddenSelectors = options.hideElements.split(',').map(selector => selector.trim());
			const hiddenElements = [...document.querySelectorAll(hiddenSelectors)];
			return !hiddenElements.some(hiddenElement => {
				return hiddenElement.contains(message.element);
			});
		}

	}

})(typeof module !== 'undefined' && module.exports ? module.exports : window));

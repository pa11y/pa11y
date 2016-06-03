'use strict';

function injectPa11y(window, options, done) {
	// jshint maxstatements: false

	var messageTypeMap = {
		1: 'error',
		2: 'warning',
		3: 'notice'
	};
	setTimeout(runCodeSniffer, options.wait);


	function runCodeSniffer() {
		try {
			window.HTMLCS.process(options.standard, window.document, onCodeSnifferComplete);
		} catch (error) {
			reportError('HTML CodeSniffer: ' + error.message);
		}
	}

	function onCodeSnifferComplete() {
		done({
			messages: processMessages(window.HTMLCS.getMessages())
		});
	}

	function processMessages(messages) {
		if (options.rootElement) {
			messages = messages.filter(isMessageInTestArea);
		}

		if (options.hideElements) {
			messages = messages.filter(isElementOutsideHiddenArea);
		}

		return messages.map(processMessage).filter(isMessageWanted);
	}

	function processMessage(message) {
		return {
			code: message.code,
			context: processMessageHtml(message.element),
			message: message.msg,
			type: (messageTypeMap[message.type] || 'unknown'),
			typeCode: message.type,
			selector: getCssSelectorForElement(message.element)
		};
	}

	function processMessageHtml(element) {
		var outerHTML = null;
		var innerHTML = null;
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

	function getCssSelectorForElement(element, selectorParts) {
		selectorParts = selectorParts || [];
		if (isElementNode(element)) {
			var identifier = buildElementIdentifier(element);
			selectorParts.unshift(identifier);
			if (!element.id && element.parentNode) {
				return getCssSelectorForElement(element.parentNode, selectorParts);
			}
		}
		return selectorParts.join(' > ');
	}

	function buildElementIdentifier(element) {
		if (element.id) {
			return '#' + element.id;
		}
		var identifier = element.tagName.toLowerCase();
		if (!element.parentNode) {
			return identifier;
		}
		var siblings = getSiblings(element);
		var childIndex = siblings.indexOf(element);
		if (!isOnlySiblingOfType(element, siblings) && childIndex !== -1) {
			identifier += ':nth-child(' + (childIndex + 1) + ')';
		}
		return identifier;
	}

	function getSiblings(element) {
		return Array.prototype.slice.call(element.parentNode.childNodes).filter(isElementNode);
	}

	function isOnlySiblingOfType(element, siblings) {
		var siblingsOfType = siblings.filter(function(sibling) {
			return (sibling.tagName === element.tagName);
		});
		return (siblingsOfType.length <= 1);
	}

	function isElementNode(element) {
		return (element.nodeType === 1);
	}

	function isMessageInTestArea(message) {
		var rootElement = window.document.querySelector(options.rootElement);

		if (rootElement) {
			return isElementWithinTestArea(message.element, rootElement);
		} else {
			return true;
		}
	}

	function isElementOutsideHiddenArea(message) {
		var hiddenSelectors = options.hideElements.split(',');
		var element = message.element;
		var elementsWithinHiddenSelectors = hiddenSelectors.filter(function(selector) {
			return hiddenAreasContainsElement(element, selector);
		});

		return elementsWithinHiddenSelectors.length ? false : true;
	}

	function isElementWithinTestArea(child, parent) {
		var node = child.parentNode;
		while (node !== null) {
			if (node === parent) {
				return true;
			}
			node = node.parentNode;
		}

		return false;
	}

	function hiddenAreasContainsElement(element, hiddenSelectors) {
		/*jshint maxcomplexity:5, maxdepth:3 */
		var hiddenElements = window.document.querySelectorAll(hiddenSelectors);

		for (var i = 0; i < hiddenElements.length; i++) {
			if (element.isEqualNode(hiddenElements[i])) {
				return true;
			}

			var parent = element.parentNode;
			while (parent) {
				if (parent.isEqualNode(hiddenElements[i])) {
					return true;
				}
				parent = parent.parentNode;
			}
		}

	}

	function isMessageWanted(message) {
		if (options.ignore.indexOf(message.code.toLowerCase()) !== -1) {
			return false;
		}
		if (options.ignore.indexOf(message.type) !== -1) {
			return false;
		}
		return true;
	}

	function reportError(message) {
		done({
			error: message
		});
	}

}

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
	module.exports = injectPa11y;
}

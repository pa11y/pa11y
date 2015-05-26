'use strict';

function injectPa11y (window, options, done) {
	/* jshint maxstatements: false */

	var messageTypeMap = {
		1: 'error',
		2: 'warning',
		3: 'notice'
	};

	runCodeSniffer();

	function runCodeSniffer () {
		try {
			window.HTMLCS.process(options.standard, window.document, onCodeSnifferComplete);
		} catch (error) {
			reportError('HTML CodeSniffer: ' + error.message);
		}
	}

	function onCodeSnifferComplete () {
		done({
			messages: processMessages(window.HTMLCS.getMessages())
		});
	}

	function processMessages (messages) {
		return messages.map(processMessage);
	}

	function processMessage (message) {
		return {
			code: message.code,
			context: processMessageHtml(message.element),
			message: message.msg,
			type: (messageTypeMap[message.type] || 'unknown'),
			typeCode: message.type
		};
	}

	function processMessageHtml (element) {
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

	function reportError (message) {
		done({
			error: message
		});
	}

}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = injectPa11y;
}

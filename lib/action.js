'use strict';

module.exports = buildAction;

// This function returns a new function, turning an action string
// into code that can be used by Pa11y
function buildAction(browser, page, options, actionString) {

	// Find the first action that matches the given action string
	var actionBuilder = module.exports.allowedActions.find(function(allowedAction) {
		return allowedAction.match.test(actionString);
	});

	// Get the action runner, the function that we'll
	// actually run on the page
	var actionRunner;
	if (actionBuilder) {
		actionRunner = actionBuilder.build(browser, page, options, actionString.match(actionBuilder.match));
	}

	// Return a function which logs and runs the action
	return function(done) {
		if (!actionRunner) {
			return done(new Error('Failed action: "' + actionString + '" cannot be resolved'));
		}
		options.log.debug('Running action: ' + actionString);
		actionRunner(function(error) {
			if (!error) {
				options.log.debug('  ✔︎ action complete');
			}
			done(error);
		});
	};
}

module.exports.isValidAction = isValidAction;

function isValidAction(actionString) {
	return module.exports.allowedActions.some(function(allowedAction) {
		return allowedAction.match.test(actionString);
	});
}

module.exports.allowedActions = [

	// Action to click an element
	// E.g. "click .sign-in-button"
	{
		name: 'click-element',
		match: /^click( element)? (.+)$/i,
		build: function(browser, page, options, matches) {
			var actionOptions = {
				selector: matches[2]
			};

			return function(done) {
				page.evaluate(function(actionOptions) {
					var target = document.querySelector(actionOptions.selector);
					if (target) {
						target.click();
					}
					return Boolean(target);
				}, actionOptions, function(error, result) {
					if (!result) {
						return done(new Error('Failed action: no element matching selector "' + actionOptions.selector + '"'));
					}
					done();
				});
			};
		}
	},

	// Action to set an input field value
	// E.g. "set field #username to example"
	{
		name: 'set-field-value',
		match: /^set( field)? (.+) to (.+)$/i,
		build: function(browser, page, options, matches) {
			var actionOptions = {
				selector: matches[2],
				value: matches[3]
			};

			return function(done) {
				page.evaluate(function(actionOptions) {
					var target = document.querySelector(actionOptions.selector);
					if (target) {
						target.value = actionOptions.value;
					}
					return Boolean(target);
				}, actionOptions, function(error, result) {
					if (!result) {
						return done(new Error('Failed action: no element matching selector "' + actionOptions.selector + '"'));
					}
					done();
				});
			};
		}
	},

	// Action to check or uncheck a checkbox/radio input
	// E.g. "check field #example"
	// E.g. "uncheck field #example"
	{
		name: 'check-field',
		match: /^(check|uncheck)( field)? (.+)$/i,
		build: function(browser, page, options, matches) {
			var actionOptions = {
				checked: true,
				selector: matches[3]
			};
			if (matches[1] === 'uncheck') {
				actionOptions.checked = false;
			}

			return function(done) {
				page.evaluate(function(actionOptions) {
					var target = document.querySelector(actionOptions.selector);
					if (target) {
						target.checked = actionOptions.checked;
					}
					return Boolean(target);
				}, actionOptions, function(error, result) {
					if (!result) {
						return done(new Error('Failed action: no element matching selector "' + actionOptions.selector + '"'));
					}
					done();
				});
			};
		}
	},

	// Action which waits for the URL, path, or fragment to change to the given value
	// E.g. "wait for fragment to be #example"
	// E.g. "wait for path to be /example"
	// E.g. "wait for url to be https://example.com/"
	{
		name: 'wait-for-url',
		match: /^wait for (fragment|hash|path|url)( to (not )?be)? (.+)$/i,
		build: function(browser, page, options, matches) {
			var actionOptions = {
				expectedValue: matches[4],
				negated: matches[3] !== undefined,
				subject: matches[1]
			};

			function waitForValue(expectedValue, done) {
				page.evaluate(function(actionOptions) {
					/* eslint complexity: 0 */
					var value;
					switch (actionOptions.subject) {
						case 'fragment':
						case 'hash':
							value = window.location.hash;
							break;
						case 'path':
							value = window.location.pathname;
							break;
						case 'url':
							value = window.location.href;
							break;
					}
					return value;
				}, actionOptions, function(error, result) {
					options.log.debug('  … waiting ("' + result + '")');
					if ((result === actionOptions.expectedValue) === !actionOptions.negated) {
						done();
					} else {
						setTimeout(function() {
							waitForValue(actionOptions.expectedValue, done);
						}, 200);
					}
				});
			};

			return function(done) {
				waitForValue(actionOptions.expectedValue, done);
			};
		}
	}

];

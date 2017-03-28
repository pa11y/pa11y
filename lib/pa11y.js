'use strict';

var buildAction = require('./action');
var once = require('once');
var async = require('async');
var extend = require('node.extend');
var lowercase = require('lower-case');
var pkg = require('../package.json');
var path = require('path');
var truffler = require('truffler');
var trufflerPkg = require('truffler/package.json');
var phantomjsPath = require('phantomjs-prebuilt').path;

module.exports = pa11y;
module.exports.validateAction = buildAction.isValidAction;
module.exports.defaults = {
	actions: [],
	beforeScript: null,
	hideElements: null,
	htmlcs: path.join(__dirname, '/vendor/HTMLCS.js'),
	ignore: [],
	log: {
		begin: /* istanbul ignore next */ function() {},
		debug: /* istanbul ignore next */ function() {},
		error: /* istanbul ignore next */ function() {},
		info: /* istanbul ignore next */ function() {},
		results: /* istanbul ignore next */ function() {}
	},
	page: {
		settings: {
			userAgent: 'pa11y/' + pkg.version + ' (truffler/' + trufflerPkg.version + ')'
		}
	},
	phantom: {
		onStdout: /* istanbul ignore next */ function() {},
		parameters: {
			'ignore-ssl-errors': 'true'
		},
		path: phantomjsPath
	},
	rootElement: null,
	rules: [],
	screenCapture: null,
	standard: 'WCAG2AA',
	allowedStandards: ['Section508', 'WCAG2A', 'WCAG2AA', 'WCAG2AAA'],
	wait: 0,
	verifyPage: null
};

function pa11y(options) {
	options = defaultOptions(options);
	if (options.allowedStandards.indexOf(options.standard) === -1) {
		throw new Error('Standard must be one of ' + options.allowedStandards.join(', '));
	}
	return truffler(options, testPage);
}

function defaultOptions(options) {
	options = extend(true, {}, module.exports.defaults, options);
	options.ignore = options.ignore.map(lowercase);
	return options;
}

function testPage(browser, page, options, done) {

	page.onCallback = once(function(result) {
		if (result instanceof Error) {
			return done(result);
		}
		if (result.error) {
			return done(new Error(result.error));
		}
		options.log.debug('Document title: "' + result.documentTitle + '"');

		// Generate a screen capture
		if (options.screenCapture) {
			options.log.info('Capturing screen, saving to "' + options.screenCapture + '"');
			return page.render(options.screenCapture, function(error) {
				if (error) {
					options.log.error('Error capturing screen: ' + error.message);
				}
				done(null, result.messages);
			});
		}

		done(null, result.messages);
	});

	async.waterfall([

		// Run beforeScript function
		function(next) {
			if (typeof options.beforeScript !== 'function') {
				return next();
			} else if (options.actions.length) {
				options.log.info('beforeScript cannot be used in combination with actions, ignoring beforeScript');
				return next();
			}
			options.log.debug('Running beforeScript');
			options.beforeScript(page, options, next);
		},

		// Run actions
		function(next) {
			if (!options.actions.length) {
				return next();
			}
			options.log.info('Running actions');
			var actions = options.actions.map(function(actionString) {
				return buildAction(browser, page, options, actionString);
			});
			async.series(actions, function(error) {
				if (!error) {
					options.log.info('Finished running actions');
				}
				next(error);
			});
		},

		// Inject HTML CodeSniffer
		function(next) {
			options.log.debug('Injecting HTML CodeSniffer');
			if (/^(https?|file):\/\//.test(options.htmlcs)) {
				// Include remote URL
				page.includeJs(options.htmlcs, function(error, included) {
					if (error) {
						return next(error);
					}
					if (!included) {
						return next(new Error('Pa11y was unable to include scripts in the page'));
					}
					next();
				});
			} else {
				// Inject local file
				page.injectJs(options.htmlcs, function(error, injected) {
					if (error) {
						return next(error);
					}
					if (!injected) {
						return next(new Error('Pa11y was unable to inject scripts into the page'));
					}
					next();
				});
			}
		},

		// Inject Pa11y
		function(next) {
			options.log.debug('Injecting Pa11y');
			page.injectJs(path.join(__dirname, '/inject.js'), function(error, injected) {
				if (error) {
					return next(error);
				}
				if (!injected) {
					return next(new Error('Pa11y was unable to inject scripts into the page'));
				}

				next();
			});
		},

		// Run Pa11y on the page
		function(next) {
			options.log.debug('Running Pa11y on the page');
			if (options.wait > 0) {
				options.log.debug('Waiting for ' + options.wait + 'ms');
			}
			page.evaluate(function(options) {
				/* global injectPa11y: true, window: true */
				if (typeof window.callPhantom !== 'function') {
					return {
						error: 'Pa11y could not report back to PhantomJS'
					};
				}
				injectPa11y(window, options, window.callPhantom);
			}, {
				hideElements: options.hideElements,
				ignore: options.ignore,
				rootElement: options.rootElement,
				standard: options.standard,
				wait: options.wait,
				verifyPage: options.verifyPage,
				rules: options.rules
			}, next);
		}

	], function(error, result) {
		// catch any errors which occur in the injection process
		if (error) {
			page.onCallback(error);
		}
		if (result && result.error) {
			page.onCallback(result);
		}
	});
}

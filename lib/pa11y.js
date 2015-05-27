'use strict';

var once = require('once');
var async = require('async');
var extend = require('node.extend');
var pkg = require('../package.json');
var truffler = require('truffler');
var trufflerPkg = require('truffler/package.json');

module.exports = pa11y;
module.exports.defaults = {
	log: {
		begin: function () {},
		debug: function () {},
		error: function () {},
		info: function () {},
		results: function () {}
	},
	page: {
		settings: {
			userAgent: 'pa11y/' + pkg.version + ' (truffler/' + trufflerPkg.version + ')'
		}
	},
	standard: 'WCAG2AA',
	timeout: 30000
};

function pa11y (options, done) {
	options = defaultOptions(options);
	options.testFunction = testPage.bind(null, options);
	truffler(options, done);
}

function defaultOptions (options) {
	return extend(true, {}, module.exports.defaults, options);
}

function testPage (options, browser, page, done) {
	var startTime = Date.now();
	options.log.debug('Starting timeout timer (' + options.timeout + 'ms)');
	var pageCallback = once(function (result) {
		clearTimeout(timer);
		options.log.debug('Test running completed in ' + (Date.now() - startTime) + 'ms');
		if (result instanceof Error) {
			return done(result);
		}
		if (result.error) {
			return done(new Error(result.error));
		}
		done(null, result.messages);
	});
	var timer = setTimeout(function () {
		page.close();
		pageCallback(new Error('Pa11y timed out'));
	}, options.timeout);
	page.set('onCallback', pageCallback);
	async.series({

		injectCodeSniffer: function (next) {
			options.log.debug('Injecting HTML CodeSniffer');
			page.injectJs(__dirname + '/vendor/HTMLCS.js', function (injected) {
				if (!injected) {
					return next(new Error('Pa11y was unable to inject scripts into the page'));
				}
				next();
			});
		},

		injectPa11y: function (next) {
			options.log.debug('Injecting Pa11y');
			page.injectJs(__dirname + '/inject.js', function (injected) {
				if (!injected) {
					return next(new Error('Pa11y was unable to inject scripts into the page'));
				}
				next();
			});
		},

		run: function (next) {
			options.log.debug('Running Pa11y on the page');
			page.evaluate(function (options) {
				/* global injectPa11y: true, window: true */
				if (typeof window.callPhantom !== 'function') {
					return new Error('Pa11y could not report back to PhantomJS');
				}
				injectPa11y(window, options, window.callPhantom);
			}, next, {
				standard: options.standard
			});
		}

	}, function (error) {
		// catch any errors which occur in the injection process
		if (error) {
			pageCallback(error);
		}
	});
}

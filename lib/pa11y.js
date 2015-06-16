// This file is part of pa11y.
//
// pa11y is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// pa11y is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with pa11y.  If not, see <http://www.gnu.org/licenses/>.

'use strict';

var once = require('once');
var async = require('async');
var extend = require('node.extend');
var lowercase = require('lower-case');
var pkg = require('../package.json');
var truffler = require('truffler');
var trufflerPkg = require('truffler/package.json');

module.exports = pa11y;
module.exports.defaults = {
	ignore: [],
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
	phantom: {
		onStdout: function () {},
		parameters: {
			'ignore-ssl-errors': 'true',
			'ssl-protocol': 'tlsv1'
		}
	},
	standard: 'WCAG2AA',
	timeout: 30000
};

function pa11y (options, done) {
	options = defaultOptions(options);
	var optionsError = validateOptions(options);
	if (optionsError) {
		options.log.error('Invalid options provided');
		return done(optionsError);
	}
	options.testFunction = testPage.bind(null, options);
	truffler(options, done);
}

function defaultOptions (options) {
	options = extend(true, {}, module.exports.defaults, options);
	options.ignore = options.ignore.map(lowercase);
	return options;
}

function validateOptions (options) {
	if (['Section508', 'WCAG2A', 'WCAG2AA', 'WCAG2AAA'].indexOf(options.standard) === -1) {
		return new Error('Standard must be one of Section508, WCAG2A, WCAG2AA, WCAG2AAA');
	}
	if (typeof options.timeout !== 'number' && !/^\d+$/.test(options.timeout)) {
		return new Error('Timeout must be numeric');
	}
}

function testPage (options, browser, page, done) {

	var pageCallback = once(function (result) {
		clearTimeout(timer);
		options.log.debug('Test running completed (' + (Date.now() - startTime) + 'ms)');
		if (result instanceof Error) {
			return done(result);
		}
		if (result.error) {
			return done(new Error(result.error));
		}
		done(null, result.messages);
	});

	var startTime = Date.now();
	options.log.debug('Starting timeout timer');
	var timer = setTimeout(function () {
		page.close();
		pageCallback(new Error('Pa11y timed out'));
	}, options.timeout);

	page.set('onCallback', pageCallback);
	async.series({

		injectCodeSniffer: function (next) {
			options.log.debug('Injecting HTML CodeSniffer (' + (Date.now() - startTime) + 'ms)');
			page.injectJs(__dirname + '/vendor/HTMLCS.js', function (injected) {
				if (!injected) {
					return next(new Error('Pa11y was unable to inject scripts into the page'));
				}
				next();
			});
		},

		injectPa11y: function (next) {
			options.log.debug('Injecting Pa11y (' + (Date.now() - startTime) + 'ms)');
			page.injectJs(__dirname + '/inject.js', function (injected) {
				if (!injected) {
					return next(new Error('Pa11y was unable to inject scripts into the page'));
				}
				next();
			});
		},

		run: function (next) {
			options.log.debug('Running Pa11y on the page (' + (Date.now() - startTime) + 'ms)');
			page.evaluate(function (options) {
				/* global injectPa11y: true, window: true */
				if (typeof window.callPhantom !== 'function') {
					return new Error('Pa11y could not report back to PhantomJS');
				}

				window.setTimeout(function () {
					//Wait a bit to let the page finish loading
					injectPa11y(window, options, window.callPhantom);
				}, 500);
			}, next, {
				ignore: options.ignore,
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

/* globals window */
'use strict';

var async = require('async');
var phantomWait = require('../phantom-wait');

// Load and run HTML CodeSniffer on a page
exports = module.exports = function (page, opts, callback) {
	async.waterfall([

		// Set up required variables in our page
		function (next) {
			page.evaluate(function (vars) {
				window.__pa11y = vars;
			}, function () {
				next(null);
			}, {
				isComplete: false,
				standard: opts.standard
			});
		},

		// Load the script
		function (next) {
			page.includeJs(opts.htmlcs, function () {
				phantomWait.wait(page, function () {
					return (typeof window.HTMLCS !== 'undefined');
				}, function () {
					next(null);
				});
			});
		},

		// Run the sniffer
		function (next) {
			page.evaluate(function () {
				try {
					window.HTMLCS.process(window.__pa11y.standard, window.document, function () {
						window.__pa11y.isComplete = true;
					});
				} catch (err) {
					return err;
				}
			}, function (err) {
				if (err) {
					return next(new Error('HTML CodeSniffer error'));
				}
				phantomWait.wait(page, function () {
					return (window.__pa11y.isComplete === true);
				}, function () {
					next(null);
				});
			});
		},

		// Get messages
		function (next) {
			page.evaluate(function () {
				return window.HTMLCS.getMessages();
			}, function (messages) {
				next(null, messages);
			});
		}

	], callback);
};

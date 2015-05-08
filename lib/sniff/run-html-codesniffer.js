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
				return window.HTMLCS.getMessages().map(function (message) {
					var outerHTML;
					if (message.element.outerHTML) {
						outerHTML = message.element.outerHTML;
						if (message.element.innerHTML.length > 31) {
							var innerHTML = message.element.innerHTML.substr(0, 31) + '...';
							outerHTML = outerHTML.replace(
								message.element.innerHTML,
								innerHTML
							);
							if (outerHTML.length > 251) {
								outerHTML = outerHTML.substr(0, 250) + '...';
							}
						}
					} else {
						outerHTML = 'unknown';
					}

					return {
						code: message.code,
						data: message.data,
						msg: message.msg,
						type: message.type,
						outerHTML: outerHTML
					};
				});
			}, function (messages) {
				next(null, messages);
			});
		}

	], callback);
};

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

/* jshint maxparams: 5 */
'use strict';

var _ = require('underscore');
var async = require('async');
var phantom = require('phantom');

// Load a URL
exports = module.exports = function (url, options, callback) {
	var res = {};
	async.series([
		function (next) {
			phantom.create({port: options.port}, function (browser) {
				res.browser = browser;
				next(null);
			});
		},
		function (next) {
			_.each(options.cookies, function (cookie) {
				res.browser.addCookie(cookie.name, cookie.value, cookie.domain);
			});
			res.browser.createPage(function (page) {
				page.set('settings.userAgent', options.userAgent);
				if (options.viewport) {
					page.set('viewportSize', options.viewport);
				}
				res.page = page;
				next(null);
			});
		},
		function (next) {
			res.page.open(url, function (status) {
				if (status === 'fail') {
					next(new Error('URL could not be loaded'), res);
				} else {
					next(null);
				}
			});
		}
	], function (err) {
		callback(err, res.browser, res.page);
	});
};

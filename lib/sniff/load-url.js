'use strict';

var async = require('async');
var phantom = require('phantom');

// Load a URL
exports = module.exports = function (url, callback) {
	var res = {};
	async.series([
		function (next) {
			phantom.create(function (browser) {
				res.browser = browser;
				next(null);
			});
		},
		function (next) {
			res.browser.createPage(function (page) {
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

'use strict';

// Dependencies
var fs = require('fs');
var path = require('path');

// Load a reporter
exports.load = function (name, callback) {
	var reporterPath = path.join(__dirname, 'reporters', name + '.js');
	fs.exists(reporterPath, function (exists) {
		var reporter;
		try {
			reporter = require(exists ? reporterPath : 'pa11y-reporter-' + name);
		} catch (err) {
			return callback(err, null);
		}
		reporter.debug = reporter.debug || function () {};
		callback(null, reporter);
	});
};

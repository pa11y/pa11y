'use strict';

// Dependencies
var fs = require('fs');
var path = require('path');

// Load a reporter
exports.load = function (name, callback) {
	var reporterPath = path.join(__dirname, 'reporters', name + '.js');
	fs.exists(reporterPath, function (exists) {
		var reporter = require(exists ? reporterPath : 'pa11y-reporter-' + name);
		callback(null, reporter);
	});
};

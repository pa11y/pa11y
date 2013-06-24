'use strict';

var _ = require('underscore');
var fs = require('fs');
var path = require('path');

// Get a reporter path based on name
function getReporterPath (name) {
	return path.join(__dirname, 'reporters', name + '.js');
}

// Get a reporter module based on name
function getReporterModule (name) {
	return 'pa11y-reporter-' + name;
}

// Default reporter (used in sanitization)
var emptyFn = function () {};
var defaultReporter = {
	begin: emptyFn,
	log: emptyFn,
	debug: emptyFn,
	error: emptyFn,
	handleResult: emptyFn,
	end: emptyFn
};

// Sanitize a loaded reporter
exports.sanitize = function (reporter) {
	return _.defaults({}, reporter, defaultReporter);
};

// Load a reporter
exports.load = function (name, callback) {
	var reporterPath = getReporterPath(name);
	var reporterModule = getReporterModule(name);

	fs.exists(reporterPath, function (exists) {
		var reporter;
		try {
			reporter = require(exists ? reporterPath : reporterModule);
		} catch (err) {
			return callback(err, null);
		}
		callback(null, exports.sanitize(reporter));
	});
};

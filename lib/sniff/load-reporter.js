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

var _ = require('underscore');
var fs = require('fs');
var path = require('path');

// Load a reporter
exports = module.exports = function (name, callback) {
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


// Get a reporter path based on name
function getReporterPath (name) {
	return path.join(__dirname, '..', 'reporters', name + '.js');
}

// Get a reporter module based on name
function getReporterModule (name) {
	return 'pa11y-reporter-' + name;
}

// Sanitize a loaded reporter
exports.sanitize = function (reporter) {
	return _.defaults({}, reporter, defaultReporter);
};


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

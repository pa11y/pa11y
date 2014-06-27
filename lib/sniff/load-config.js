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

// Load a config file
exports = module.exports = function (configPath, callback) {
	fs.readFile(path.resolve(process.cwd(), configPath), 'utf8', function (err, contents) {
		if (err) {
			return callback(new Error('Config file ' + configPath + ' not found'), null);
		}
		var config;
		try {
			config = JSON.parse(contents);
		} catch (err) {
			err.message = (err.message || 'Invalid JSON') + ' in ' + configPath;
			err.file = configPath;
			return callback(err, null);
		}
		callback(null, exports.sanitize(config));
	});
};

// Sanitize loaded configurations
exports.sanitize = function (config) {
	config = _.clone(config);
	if (!Array.isArray(config.cookies) || !_.every(config.cookies, _.isObject)) {
		config.cookies = [];
	}
	if (!Array.isArray(config.ignore)) {
		config.ignore = [];
	}
	return config;
};

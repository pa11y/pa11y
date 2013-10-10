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

'use strict';

var _ = require('underscore');
var path = require('path');

// Load a config file
exports = module.exports = function (configPath, callback) {
	var config;
	try {
		config = require(path.resolve(process.cwd(), configPath));
	} catch (err) {
		return callback(new Error('Config file ' + configPath + ' not found'), null);
	}
	callback(null, exports.sanitize(config));
};

// Sanitize loaded configurations
exports.sanitize = function (config) {
	config = _.clone(config);
	if (!Array.isArray(config.ignore)) {
		config.ignore = [];
	}
	return config;
};

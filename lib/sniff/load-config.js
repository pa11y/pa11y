'use strict';

var _ = require('underscore');

// Load a config file
exports = module.exports = function (path, callback) {
	var config;
	try {
		config = require(path);
	} catch (err) {
		return callback(new Error('Config file "' + path + '" not found'), null);
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

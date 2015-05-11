'use strict';

var extend = require('node.extend');
var pkg = require('../package.json');

module.exports = pa11y;
module.exports.defaults = {
	log: {
		debug: function () {},
		error: function () {},
		info: function () {}
	},
	page: {
		cookies: [],
		settings: {},
		viewport: {
			width: 1024,
			height: 768
		}
	},
	phantom: {
		port: 12300
	},
	standard: 'WCAG2AA',
	timeout: 30000,
	useragent: 'pa11y/' + pkg.version
};

function pa11y (options, done) {
	options = defaultOptions(options);
	done(null, function () {});
}

function defaultOptions (options) {
	return extend(true, {}, module.exports.defaults, options);
}

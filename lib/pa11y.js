'use strict';

var extend = require('node.extend');
var pkg = require('../package.json');
var truffler = require('truffler');
var trufflerPkg = require('truffler/package.json');

module.exports = pa11y;
module.exports.defaults = {
	log: {
		debug: function () {},
		error: function () {},
		info: function () {}
	},
	page: {
		settings: {
			userAgent: 'pa11y/' + pkg.version + ' (truffler/' + trufflerPkg.version + ')'
		}
	},
	standard: 'WCAG2AA',
	timeout: 30000
};

function pa11y (options, done) {
	options = defaultOptions(options);
	options.testFunction = testPage;
	truffler(options, done);
}

function defaultOptions (options) {
	return extend(true, {}, module.exports.defaults, options);
}

function testPage (browser, page, done) {
	done();
}

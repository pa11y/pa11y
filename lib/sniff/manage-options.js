'use strict';

var _ = require('underscore');
var OptionError = require('../error/option-error');
var url = require('../url');
var pkg = require('../../package.json');

// Manage sniffer options
exports = module.exports = function (opts, callback) {
	/* jshint maxcomplexity: 6, maxstatements: 20 */
	var err = null;
	opts = _.extend({}, exports.defaultOptions, opts);

	// URL handling
	if (opts.url) {
		opts.url = url.sanitize(opts.url);
	}
	else {
		err = new OptionError('No URL provided');
	}

	// Local HTML_CodeSniffer URL
	if (opts.htmlcs) {
		opts.htmlcs = url.sanitize(opts.htmlcs);
	}

	// timeout handling
	opts.timeout = parseInt(opts.timeout, 10);
	if (isNaN(opts.timeout) || opts.timeout === Infinity) {
		err = new OptionError('Timeout must be a number');
	}

	// port handling
	opts.port = parseInt(opts.port, 10);
	if (isNaN(opts.port) || opts.port === Infinity) {
		err = new OptionError('Port must be a number');
	}

	// Standard handling
	if (exports.allowableStandards.indexOf(opts.standard) === -1) {
		err = new OptionError('Standard must be one of ' + exports.allowableStandards.join(', '));
	}

	callback(err, opts);
};

// Default options to use
exports.defaultOptions = {
	debug: false,
	htmlcs: 'http://squizlabs.github.io/HTML_CodeSniffer/build/HTMLCS.js',
	port: 12300,
	standard: 'WCAG2AA',
	timeout: 30000,
	useragent: 'pa11y/' + pkg.version
};

// Allowable standards
exports.allowableStandards = [
	'Section508',
	'WCAG2A',
	'WCAG2AA',
	'WCAG2AAA'
];

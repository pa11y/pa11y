'use strict';

var _ = require('underscore');
var OptionError = require('../error/option-error');
var url = require('../url');
var pkg = require('../../package.json');

// Manage sniffer options
exports = module.exports = function (opts, callback) {
	var err = null;
	opts = _.extend({}, exports.defaultOptions, opts);
	try {
		opts.url = manageUrlOption(opts.url, 'No URL provided');
		opts.htmlcs = manageUrlOption(opts.htmlcs, 'No HTML CodeSniffer URL provided');
		opts.timeout = manageNumericOption(opts.timeout, 'Timeout must be a number');
		opts.port = manageNumericOption(opts.port, 'Port must be a number');
		opts.standard = manageMultipleChoiceOption(
			opts.standard,
			exports.allowableStandards,
			'Standard must be one of ' + exports.allowableStandards.join(', ')
		);
	} catch (error) {
		err = error;
	}
	callback(err, opts);
};

function manageUrlOption (str, errMessage) {
	if (str) {
		return url.sanitize(str);
	}
	throw new OptionError(errMessage);
}

function manageNumericOption (num, errMessage) {
	num = parseInt(num, 10);
	if (!isNaN(num) && num !== Infinity) {
		return num;
	}
	throw new OptionError(errMessage);
}

function manageMultipleChoiceOption (choice, choices, errMessage) {
	if (choices.indexOf(choice) !== -1) {
		return choice;
	}
	throw new OptionError(errMessage);
}

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

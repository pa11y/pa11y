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
		opts.viewport.height = manageNumericOption(
			opts.viewport.height,
			'Viewport height must be a number'
		);
		opts.viewport.width = manageNumericOption(
			opts.viewport.width,
			'Viewport width must be a number'
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
	strict: false,
	timeout: 30000,
	viewport: {
		width: 640,
		height: 480,
	},
	useragent: 'pa11y/' + pkg.version
};

// Allowable standards
exports.allowableStandards = [
	'Section508',
	'WCAG2A',
	'WCAG2AA',
	'WCAG2AAA'
];

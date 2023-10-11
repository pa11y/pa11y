'use strict';

const extend = require('node.extend');
const fs = require('fs');
const path = require('path');

module.exports.parseArguments = parseArguments;
module.exports.verifyOptions = verifyOptions;

/**
 * Parse arguments from the command-line to properly identify the url, options, and callback
 * @param {String} url - The URL to run tests against.
 * @param {Object} [options={}] - Options to change the way tests run.
 * @param {Object} [defaults] - Pa11y's defaults.
 * @param {Function} [callback] - An optional callback to use instead of promises.
 * @returns {Array} the new values of url, options, and callback
 */
function parseArguments(url, options, defaults, callback) {
	if (!callback && typeof options === 'function') {
		callback = options;
		options = {};
	}
	if (typeof url !== 'string') {
		options = url;
		url = options.url;
	}

	url = sanitizeUrl(url, defaults);
	options = defaultOptions(options, defaults);

	return [url,
		options,
		callback];
}

/**
 * Verify that passed in options are valid.
 * @param {Object} options - The options to verify.
 * @param {Object} allowedStandards - A list of standards allowed to be used.
 * @returns {Undefined} Returns nothing.
 * @throws {Error} Throws if options are not valid.
 */
function verifyOptions(options, allowedStandards) {
	if (!allowedStandards.includes(options.standard)) {
		throw new Error(`Standard must be one of ${allowedStandards.join(', ')}`);
	}
	if (options.page && !options.browser) {
		throw new Error('The page option must only be set alongside the browser option');
	}
	if (options.ignoreUrl && !options.page) {
		throw new Error('The ignoreUrl option must only be set alongside the page option');
	}
}

/**
 * Default the passed in options using Pa11y's defaults.
 * @private
 * @param {Object} [options] - The options to apply defaults to.
 * @param {Object} [defaults] - Pa11y's defaults.
 * @returns {Object} Returns the defaulted options.
 */
function defaultOptions(options, defaults) {

	options = extend({}, defaults, options);

	// Prevents problems if .ignore goes missing in the future because a change in defaults
	if (options.ignore) {
		options.ignore = options.ignore.map(ignored => ignored.toLowerCase());

		// We now ignore warnings and notices by default since pa11y 5
		if (!options.includeNotices) {
			options.ignore.push('notice');
		}
		if (!options.includeWarnings) {
			options.ignore.push('warning');
		}
	}

	return options;
}

/**
 * Sanitize a URL, ensuring it has a scheme. If the URL begins with a period or it
 * is a valid path relative to the current directory, it is assumed to be a file path
 * and is resolved relative to the current working directory. If it is an absolute
 * file path, that file path is used. If the URL does begin with a scheme, it will
 * be prepended with "http://".
 * @private
 * @param {String} url - The URL to sanitize.
 * @returns {String} Returns the sanitized URL.
 */
function sanitizeUrl(url) {
	let sanitizedUrl = url;
	if (/^[.]/i.test(url) || path.isAbsolute(url) || fs.existsSync(url)) {
		// This works for absolute paths since path.resolve starts at the right and
		// works left, stopping once it has an absolute path. So, if the URL is an
		// absolute path it is returned.
		sanitizedUrl = `file://${path.resolve(process.cwd(), url)}`;
	} else if (!/^(https?|file):\/\//i.test(url)) {
		sanitizedUrl = `http://${url}`;
	}
	return sanitizedUrl;
}

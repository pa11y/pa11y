'use strict';

module.exports = buildReporter;

/**
 * Build a Pa11y reporter.
 * @private
 * @param {Object} methods - The reporter methods.
 * @returns {Promise} Returns a promise which resolves with the new reporter.
 */
function buildReporter(methods) {
	return {
		supports: methods.supports,
		begin: buildReporterMethod(methods.begin),
		results: buildReporterMethod(methods.results),
		log: {
			debug: buildReporterMethod(methods.debug),
			error: buildReporterMethod(methods.error, 'error'),
			info: buildReporterMethod(methods.info)
		}
	};
}

/**
 * Build a Pa11y reporter method, making it async and only outputting when
 * actual output is returned.
 * @private
 * @param {Function} method - The reporter method to build.
 * @param {String} [consoleMethod='log'] - The console method to use in reporting.
 * @returns {Function} Returns a built async reporter method.
 */
function buildReporterMethod(method, consoleMethod = 'log') {
	if (typeof method !== 'function') {
		method = () => { /* NoOp */ };
	}
	return async input => {
		const output = await method(input);
		if (output) {
			console[consoleMethod](output);
		}
	};
}

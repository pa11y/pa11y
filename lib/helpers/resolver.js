'use strict';

const loadReporter = require('./loader');

const reporterShorthand = {
	cli: require.resolve('../reporters/cli.js'),
	json: require.resolve('../reporters/json.js')
};

module.exports = function resolveReporters(config = {}) {
	if (!Array.isArray(config.reporters) || config.reporters.length === 0) {
		return [];
	}
	return config.reporters.map(reporter => {
		let reporterOptions = {};
		if (Array.isArray(reporter)) {
			[reporter, reporterOptions = {}] = reporter;
		}
		if (typeof reporter !== 'string') {
			return undefined;
		}
		if (Object.keys(reporterShorthand).includes(reporter)) {
			reporter = reporterShorthand[reporter];
		}
		const reporterModule = loadReporter(reporter);

		if (typeof reporterModule === 'function') {
			return reporterModule(reporterOptions, config);
		}
		return reporterModule;
	}).filter(Boolean);
};

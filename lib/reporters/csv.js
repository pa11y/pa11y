'use strict';

const report = module.exports = {};

// Pa11y version support
report.supports = '^7.0.0 || ^7.0.0-alpha || ^7.0.0-beta';

// Output formatted results
report.results = results => {
	return ['"type","code","message","context","selector"']
		.concat(results.issues.map(report.row))
		.join('\n');
};

// Internal method used to report an individual CSV row
report.row = issue => {
	const context = issue.context === null ? '' : issue.context;

	return [
		JSON.stringify(issue.type),
		JSON.stringify(issue.code),
		JSON.stringify(issue.message),
		JSON.stringify(context),
		JSON.stringify(issue.selector)
	].join(',');
};

// Output error messages
report.error = message => {
	return message;
};

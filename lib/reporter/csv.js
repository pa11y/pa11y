'use strict';

const report = module.exports = {};

// Pa11y version support
report.supports = '^5.0.0 || ^5.0.0-alpha || ^5.0.0-beta';

// Output formatted results
report.results = results => {
	return ['"type","code","message","context","selector"']
		.concat(results.issues.map(report.row))
		.join('\n');
};

// Internal method used to report an individual CSV row
report.row = issue => {
	return [
		JSON.stringify(issue.type),
		JSON.stringify(issue.code),
		JSON.stringify(issue.message),
		JSON.stringify(issue.context),
		JSON.stringify(issue.selector)
	].join(',');
};

// Output error messages
report.error = message => {
	return message;
};

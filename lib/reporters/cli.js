'use strict';

const {cyan, green, grey, red, underline, yellow} = require('kleur');

const report = module.exports = {};

// Pa11y version support
report.supports = '^9.0.0 || ^9.0.0-alpha || ^9.0.0-beta';

// Helper strings for use in reporter methods
const start = cyan(' >');
const typeStarts = {
	error: red(' • Error:'),
	notice: cyan(' • Notice:'),
	unknown: grey(' •'),
	warning: yellow(' • Warning:')
};

// Output the welcome message once Pa11y begins testing
report.begin = () => {
	return cleanWhitespace(`

		${cyan(underline('Welcome to Pa11y'))}

	`);
};

// Output formatted results
report.results = results => {
	if (results.issues.length) {
		return cleanWhitespace(`

			${underline(`Results for URL: ${results.pageUrl}`)}
			${results.issues.map(report.issue).join('\n')}

			${report.totals(results)}

		`);
	}
	return cleanWhitespace(`

		${green('No issues found!')}

	`);
};

// Internal method used to report an individual result
report.issue = issue => {
	const code = issue.code;
	const selector = issue.selector.replace(/\s+/g, ' ');
	const context = (issue.context ? issue.context.replace(/\s+/g, ' ') : '[no context]');
	return cleanWhitespace(`

		${typeStarts[issue.type]} ${issue.message}
		   ${grey(`├── ${code}`)}
		   ${grey(`├── ${selector}`)}
		   ${grey(`└── ${context}`)}
	`);
};

// Internal method used to report issue totals
report.totals = results => {
	const totals = {
		errors: results.issues.filter(issue => issue.type === 'error').length,
		warnings: results.issues.filter(issue => issue.type === 'warning').length,
		notices: results.issues.filter(issue => issue.type === 'notice').length
	};
	const output = [];
	if (totals.errors > 0) {
		output.push(red(`${totals.errors} Errors`));
	}
	if (totals.warnings > 0) {
		output.push(yellow(`${totals.warnings} Warnings`));
	}
	if (totals.notices > 0) {
		output.push(cyan(`${totals.notices} Notices`));
	}
	return output.join('\n');
};

// Output error messages
report.error = message => {
	if (!/^error:/i.test(message)) {
		message = `Error: ${message}`;
	}
	return cleanWhitespace(`

		${red(message)}

	`);
};

// Output debug messages
report.debug = message => {
	message = `Debug: ${message}`;
	return cleanWhitespace(`
		${start} ${grey(message)}
	`);
};

// Output information messages
report.info = message => {
	return cleanWhitespace(`
		${start} ${message}
	`);
};

// Clean whitespace from output. This function is used to keep
// the reporter code a little cleaner
function cleanWhitespace(string) {
	return string.replace(/\t+|^\t*\n|\n\t*$/g, '');
}

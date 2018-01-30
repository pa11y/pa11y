'use strict';

const chalk = require('chalk');

const report = module.exports = {};

// Pa11y version support
report.supports = '^5.0.0 || ^5.0.0-alpha || ^5.0.0-beta';

// Helper strings for use in reporter methods
const start = chalk.cyan(' >');
const typeStarts = {
	error: chalk.red(' • Error:'),
	notice: chalk.cyan(' • Notice:'),
	unknown: chalk.grey(' •'),
	warning: chalk.yellow(' • Warning:')
};

// Output the welcome message once Pa11y begins testing
report.begin = () => {
	return cleanWhitespace(`

		${chalk.cyan.underline('Welcome to Pa11y')}

	`);
};

// Output formatted results
report.results = results => {
	if (results.issues.length) {
		return cleanWhitespace(`

			${chalk.underline(`Results for URL: ${results.pageUrl}`)}
			${results.issues.map(report.issue).join('\n')}

			${report.totals(results)}

		`);
	}
	return cleanWhitespace(`

		${chalk.green('No issues found!')}

	`);
};

// Internal method used to report an individual result
report.issue = issue => {
	const code = issue.code;
	const selector = issue.selector.replace(/\s+/g, ' ');
	const context = (issue.context ? issue.context.replace(/\s+/g, ' ') : '[no context]');
	return cleanWhitespace(`

		${typeStarts[issue.type]} ${issue.message}
		   ${chalk.grey(`├── ${code}`)}
		   ${chalk.grey(`├── ${selector}`)}
		   ${chalk.grey(`└── ${context}`)}
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
		output.push(chalk.red(`${totals.errors} Errors`));
	}
	if (totals.warnings > 0) {
		output.push(chalk.yellow(`${totals.warnings} Warnings`));
	}
	if (totals.notices > 0) {
		output.push(chalk.cyan(`${totals.notices} Notices`));
	}
	return output.join('\n');
};

// Output error messages
report.error = message => {
	if (!/^error:/i.test(message)) {
		message = `Error: ${message}`;
	}
	return cleanWhitespace(`

		${chalk.red(message)}

	`);
};

// Output debug messages
report.debug = message => {
	message = `Debug: ${message}`;
	return cleanWhitespace(`
		${start} ${chalk.grey(message)}
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

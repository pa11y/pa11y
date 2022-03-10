'use strict';

const fs = require('fs');
const mustache = require('mustache');
const path = require('path');
const {promisify} = require('util');
const readFile = promisify(fs.readFile);

const report = module.exports = {};

// Pa11y version support
report.supports = '^6.0.0 || ^6.0.0-alpha || ^6.0.0-beta';

// Compile template and output formatted results
report.results = async results => {
	const templateString = await readFile(path.resolve(`${__dirname}/report.html`), 'utf-8');
	return mustache.render(templateString, {
		// The current date
		date: new Date(),

		// Result information
		documentTitle: results.documentTitle,
		issues: results.issues.map(issue => {
			issue.typeLabel = upperCaseFirst(issue.type);
			return issue;
		}),
		pageUrl: results.pageUrl,

		// Issue counts
		errorCount: results.issues.filter(issue => issue.type === 'error').length,
		warningCount: results.issues.filter(issue => issue.type === 'warning').length,
		noticeCount: results.issues.filter(issue => issue.type === 'notice').length

	});
};

// Output error messages
report.error = message => {
	return message;
};

// Utility function to uppercase the first character of a string
function upperCaseFirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

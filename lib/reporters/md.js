'use strict';

const fs = require('fs');
const mustache = require('mustache');
const path = require('path');
const {promisify} = require('util');
const readFile = promisify(fs.readFile);

const report = module.exports = {};

// Pa11y version support
report.supports = '^8.0.0 || ^8.0.0-alpha || ^8.0.0-beta';

// Compile template and output formatted results
report.results = async results => {
	if (results.issues.length === 0) {
		return `✅ Aucune issue détectée par pa11y sur ${results.pageUrl}`;
	}
	const templateString = await readFile(path.resolve(`${__dirname}/report.md`), 'utf-8');
	return mustache.render(templateString, {
		// The current date
		date: new Date(),

		// Result information
		issues: results.issues.map(issue => {
			issue.typeLabel = upperCaseFirst(issue.type);
			const wcagIssue = issue.code && issue.code.match(
				/^WCAG2AA.*\.(\w\d+)\.*/
			);
			issue.emoji = {Error: '🔴',
				Warning: '🟡'}[issue.typeLabel] || '🟢';
			issue.codeUrl =
				wcagIssue &&
				`https://www.w3.org/TR/WCAG20-TECHS/${wcagIssue[1]}`;
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

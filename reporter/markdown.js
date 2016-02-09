'use strict';

var typeStarts = {
	error: '__Error:__ ',
	notice: '__Notice:__ ',
	unknown: '',
	warning: '__Warning:__ '
};

module.exports = {
	begin: reportBegin,
	error: reportError,
	debug: emptyFunction,
	info: emptyFunction,
	results: reportResults
};

function reportBegin() {
	console.log('# Welcome to Pa11y\n');
}

function reportResults(results, url) {
	console.log('## Results for ' + url + ':');
	if (results.length === 0) {
		return console.log('\n * No errors found!');
	}
	results.forEach(reportResult);
	console.log('');
	reportTotals(results);
}

function reportResult(result) {
	console.log(
		'* ' + typeStarts[result.type] + result.message +
		'\n' +
		' * ' + result.code +
		'\n' +
		' * ' + result.selector.replace(/\s+/g, ' ') +
		'\n' +
		' * `' + result.context.replace(/\s+/g, ' ') + '`' +
		'\n'
	);
}

function reportTotals(results) {
	var totalErrors = results.filter(isError).length;
	var totalNotices = results.filter(isNotice).length;
	var totalWarnings = results.filter(isWarning).length;
	console.log('## Summary:');
	console.log(
		'* ' + totalErrors + ' Errors' + '\n' +
		'* ' + totalWarnings + ' Warnings' + '\n' +
		'* ' + totalNotices + ' Notices' + '\n'
	);
}

function reportError(message) {
	console.error(message);
}

function emptyFunction() {}

function isError(result) {
	return (result.type === 'error');
}

function isNotice(result) {
	return (result.type === 'notice');
}

function isWarning(result) {
	return (result.type === 'warning');
}

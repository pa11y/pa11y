'use strict';

var typeStarts = {
	error: '__Error:__ ',
	notice: '__Notice:__ ',
	unknown: '',
	warning: '__Warning:__ '
};

module.exports = {
	begin: emptyFunction,
	error: reportError,
	debug: emptyFunction,
	info: emptyFunction,
	results: reportResults,
	process: buildMarkdown
};

function emptyFunction() {}

function reportError(message) {
	console.error(message);
}

function reportResults(results, url) {
	console.log(buildMarkdown(results, url));
}

function buildMarkdown(results, url) {
	var lines = [
		'# Welcome to Pa11y\n',
		'## Results for ' + url + ':'
	];
	if (results.length === 0) {
		lines.push('\n * No errors found!');
	} else {
		lines.push(buildResultsMarkdown(results));
		lines.push(buildTotalsMarkdown(results));
	}
	return lines.join('\n');
}

function buildResultsMarkdown(results) {
	return results.map(buildResultMarkdown).join('');
}

function buildResultMarkdown(result) {
	return [
		'* ' + typeStarts[result.type] + result.message,
		' * ' + result.code,
		' * ' + result.selector.replace(/\s+/g, ' '),
		' * `' + result.context.replace(/\s+/g, ' ') + '`'
	].join('\n') + '\n\n';
}

function buildTotalsMarkdown(results) {
	var totalErrors = results.filter(isError).length;
	var totalNotices = results.filter(isNotice).length;
	var totalWarnings = results.filter(isWarning).length;

	return [
		'## Summary:',
		'* ' + totalErrors + ' Errors',
		'* ' + totalWarnings + ' Warnings',
		'* ' + totalNotices + ' Notices'
	].join('\n') + '\n';
}

function isError(result) {
	return (result.type === 'error');
}

function isNotice(result) {
	return (result.type === 'notice');
}

function isWarning(result) {
	return (result.type === 'warning');
}

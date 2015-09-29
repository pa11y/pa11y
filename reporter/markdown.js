// // This file is part of pa11y.
// //
// // pa11y is free software: you can redistribute it and/or modify
// // it under the terms of the GNU General Public License as published by
// // the Free Software Foundation, either version 3 of the License, or
// // (at your option) any later version.
// //
// // pa11y is distributed in the hope that it will be useful,
// // but WITHOUT ANY WARRANTY; without even the implied warranty of
// // MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// // GNU General Public License for more details.
// //
// // You should have received a copy of the GNU General Public License
// // along with pa11y.  If not, see <http://www.gnu.org/licenses/>.

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

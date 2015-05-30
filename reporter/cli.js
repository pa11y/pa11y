// This file is part of pa11y.
//
// pa11y is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// pa11y is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with pa11y.  If not, see <http://www.gnu.org/licenses/>.

'use strict';

var chalk = require('chalk');

var start = chalk.cyan(' > ');
var typeStarts = {
	error: chalk.red(' • Error: '),
	notice: chalk.cyan(' • Notice: '),
	unknown: chalk.grey(' • '),
	warning: chalk.yellow(' • Warning: ')
};

module.exports = {
	begin: reportBegin,
	error: reportError,
	debug: reportDebug,
	info: reportInfo,
	results: reportResults
};

function reportBegin () {
	console.log(chalk.cyan.underline('Welcome to Pa11y'));
	console.log('');
}

function reportError (message) {
	if (/^error:/i.test(message)) {
		console.error(message);
	}
	else {
		console.error(start + chalk.red('Error: ' + message));
	}
}

function reportDebug (message) {
	console.log(start + chalk.gray('Debug: ' + message));
}

function reportInfo (message) {
	console.log(start + message);
}

function reportResults (results, url) {
	console.log('\n' + chalk.underline('Results for ' + url + ':'));
	if (results.length === 0) {
		return console.log('\n' + chalk.green('No errors found!') + '\n');
	}
	results.forEach(reportResult);
	console.log('');
	reportTotals(results);
}

function reportResult (result) {
	console.log(
		'\n' +
		(typeStarts[result.type]) + result.message +
		'\n' +
		'   ' + chalk.gray(result.code) +
		'\n' +
		'   ' + chalk.gray(result.context.replace(/\s+/g, ' '))
	);
}

function reportTotals (results) {
	var totalErrors = results.filter(isError).length;
	var totalNotices = results.filter(isNotice).length;
	var totalWarnings = results.filter(isWarning).length;
	console.log(
		chalk.red(totalErrors + ' Errors') +
		'\n' +
		chalk.yellow(totalWarnings + ' Warnings') +
		'\n' +
		chalk.cyan(totalNotices + ' Notices') +
		'\n'
	);
}

function isError (result) {
	return (result.type === 'error');
}

function isNotice (result) {
	return (result.type === 'notice');
}

function isWarning (result) {
	return (result.type === 'warning');
}

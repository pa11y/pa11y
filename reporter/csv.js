'use strict';

module.exports = {
	begin: emptyFunction,
	error: reportError,
	debug: emptyFunction,
	info: emptyFunction,
	results: reportResults,
	process: buildCsv
};

function emptyFunction() {}

function reportError(message) {
	console.error(message);
}

function reportResults(results) {
	console.log(buildCsv(results));
}

function buildCsv(results) {
	return ['"type","code","message","context","selector"']
		.concat(results.map(buildCsvRow))
		.join('\n');
}

function buildCsvRow(result) {
	return [
		JSON.stringify(result.type),
		JSON.stringify(result.code),
		JSON.stringify(result.message),
		JSON.stringify(result.context),
		JSON.stringify(result.selector)
	].join(',');
}

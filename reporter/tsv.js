'use strict';

module.exports = {
	begin: emptyFunction,
	error: reportError,
	debug: emptyFunction,
	info: emptyFunction,
	results: reportResults,
	process: buildTsv
};

function emptyFunction() {}

function reportError(message) {
	console.error(message);
}

function reportResults(results) {
	console.log(buildTsv(results));
}

function buildTsv(results) {
	return [['type', 'code', 'message', 'context', 'selector'].join('\t')]
		.concat(results.map(buildTsvRow))
		.join('\n');
}

function buildTsvRow(result) {
	return [
		JSON.stringify(result.type),
		JSON.stringify(result.code),
		JSON.stringify(result.message),
		JSON.stringify(result.context),
		JSON.stringify(result.selector)
	].join('\t');
}

'use strict';

module.exports = {
	begin: emptyFunction,
	error: reportError,
	debug: emptyFunction,
	info: emptyFunction,
	results: reportResults
};

function emptyFunction() {}

function reportError(message) {
	console.error(message);
}

function reportResults(results) {
	console.log('"type","code","message","context","selector"');
	results.forEach(reportResult);
}

function reportResult(result) {
	console.log([
		JSON.stringify(result.type),
		JSON.stringify(result.code),
		JSON.stringify(result.message),
		JSON.stringify(result.context),
		JSON.stringify(result.selector)
	].join(','));
}

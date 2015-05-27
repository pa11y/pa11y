'use strict';

module.exports = {
	begin: emptyFunction,
	error: reportError,
	debug: emptyFunction,
	info: emptyFunction,
	results: reportResults
};

function emptyFunction () {}

function reportError (message) {
	console.error(message);
}

function reportResults (results) {
	console.log(JSON.stringify(results));
}

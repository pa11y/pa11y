'use strict';

var bfj = require('bfj');

module.exports = {
	begin: emptyFunction,
	error: reportError,
	debug: emptyFunction,
	info: emptyFunction,
	results: reportResults,
	process: buildJson
};

function emptyFunction() {}

function reportError(message) {
	console.error(message);
}

function reportResults(results) {
	var stream = bfj.streamify(results);
	stream.on('dataError', function(error) {
		reportError(error.message);
	});
	stream.on('end', function() {
		process.stdout.write('\n');
	});
	stream.pipe(process.stdout);
}

function buildJson(results) {
	return results;
}

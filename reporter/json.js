
const bfj = require('bfj');

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
	const stream = bfj.streamify(results);
	stream.on('dataError', error => {
		reportError(error.message);
	});
	stream.on('end', () => {
		process.stdout.write('\n');
	});
	stream.pipe(process.stdout);
}

function buildJson(results) {
	return results;
}

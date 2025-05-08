'use strict';

const bfj = require('bfj');

const report = module.exports = {};

// Pa11y version support
report.supports = '^9.0.0 || ^9.0.0-alpha || ^9.0.0-beta';

// Output formatted results
// NOTE: unlike other reporters, the JSON reporter uses streams and so outputs
// results by itself rather than returning a string
report.results = results => {
	const stream = bfj.streamify(results.issues);
	stream.on('dataError', error => {
		console.error(error.stack);
		process.exit(1);
	});
	stream.on('end', () => {
		process.stdout.write('\n');
	});
	stream.pipe(process.stdout);
};

// Output error messages
report.error = message => {
	return message;
};

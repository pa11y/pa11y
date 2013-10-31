/* jshint maxlen: false, maxstatements: false */
'use strict';

var bin = __dirname + '/../../../bin/pa11y';
var exec = require('child_process').exec;

module.exports = run;

// Run a pa11y command
function run (opts, done, execOpts) {
	if (!execOpts) {
		execOpts = {};
	}
	exec(bin + ' ' + opts, execOpts, function (err, stdout, stderr) {
		done(null, {
			err: err,
			stdout: stdout.trim(),
			stderr: stderr.trim()
		});
	});
}

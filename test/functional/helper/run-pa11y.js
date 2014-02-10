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

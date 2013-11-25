/* jshint maxdepth: 3 */
'use strict';

var fs   = require('fs');
var path = require('path');

// Search the PATH env var for the given binaries
module.exports = function (PATH, binaries, cb) {
	if (!PATH) {
		return;
	}
	var dirs = PATH.split(path.delimiter);
	var len  = dirs.length;
	var bins = binaries.length;
	var i, j;
	for (i = 0; i < len; ++i) {
		for (j = 0; j < bins; ++j) {
			if (fs.existsSync(dirs[i] + path.sep + binaries[j])) {
				cb(true);
				return;
			}
		}
	}
	cb(false);
};

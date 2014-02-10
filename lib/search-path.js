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

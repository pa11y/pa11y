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

'use strict';

// Dependencies
require('colors');

// Handle a debug message
exports.debug = function (msg) {
	console.error(('Debug: ' + msg).grey);
};

// Handle an error
exports.error = function (msg) {
	console.error(('Error: ' + msg).red);
};

// Handle result
exports.handleResult = function (result) {

	// Output header
	console.log('"code","message","type"');

	// Loop results
	result.results.forEach(function (res) {
		console.log([
			JSON.stringify(res.code),
			JSON.stringify(res.message),
			JSON.stringify(res.type)
		].join(','));
	});

};

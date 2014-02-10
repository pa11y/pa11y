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
/* global before, describe, it */
'use strict';

var assert = require('proclaim');
var runPa11y = require('./helper/run-pa11y');

// TODO this relies on timing and is quite brittle, rethink in future

describe('pa11y http://localhost:4117/normal (no port specified)', function () {

	it('should use port 12300', function (done) {
		runPa11y('http://localhost:4117/normal', function () {
			done();
		});
		setTimeout(function () {
			isPortInUse(12300, function (err, portInUse) {
				assert.isTrue(portInUse);
			});
		}, 1000);
	});

});

describe('pa11y --port 12400 http://localhost:4117/normal', function () {

	it('should use port 12400', function (done) {
		runPa11y('--port 12400 http://localhost:4117/normal', function () {
			done();
		});
		setTimeout(function () {
			isPortInUse(12400, function (err, portInUse) {
				assert.isTrue(portInUse);
			});
		}, 1000);
	});

});

// Test whether a port is in use
function isPortInUse (port, done) {
	var tester = require('net').createServer();
	tester.once('error', function (err) {
		if (err.code === 'EADDRINUSE') {
			done(null, true);
		} else {
			done(err);
		}
	});
	tester.once('listening', function() {
		tester.once('close', function() {
			done(null, false);
		});
		tester.close();
	});
	tester.listen(port);
}

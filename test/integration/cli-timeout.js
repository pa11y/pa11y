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

// jshint maxstatements: false
// jscs:disable maximumLineLength
'use strict';

var assert = require('proclaim');
var describeCliCall = require('./helper/describe-cli-call');

describe('Pa11y CLI Timeout', function() {

	describeCliCall('/notices', ['--timeout', '5'], {}, function() {

		it('should respond with an exit code of `1`', function() {
			assert.strictEqual(this.lastExitCode, 1);
		});

		it('should respond with the expected output', function() {
			assert.include(this.lastStderr, 'Test function errored for "http://localhost:' + this.port + '/notices"');
			assert.include(this.lastStderr, 'Error: Pa11y timed out');
		});

	});

	describeCliCall('/notices', ['--config', './mock/config/timeout.json'], {}, function() {

		it('should respond with an exit code of `1`', function() {
			assert.strictEqual(this.lastExitCode, 1);
		});

		it('should respond with the expected output', function() {
			assert.include(this.lastStderr, 'Test function errored for "http://localhost:' + this.port + '/notices"');
			assert.include(this.lastStderr, 'Error: Pa11y timed out');
		});

	});

});

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

describe('Pa11y CLI Threshold', function() {

	describeCliCall('/manyerrors', ['--threshold', '4'], {}, function() {
		it('should respond with an exit code of `0`', function() {
			assert.strictEqual(this.lastExitCode, 0);
		});
	});

	describeCliCall('/manyerrors', ['--threshold', '3'], {}, function() {
		it('should respond with an exit code of `2`', function() {
			assert.strictEqual(this.lastExitCode, 2);
		});
	});

	describeCliCall('/manyerrors', ['--threshold', '10', '--level', 'notice'], {}, function() {
		it('should respond with an exit code of `0`', function() {
			assert.strictEqual(this.lastExitCode, 0);
		});
	});

	describeCliCall('/manyerrors', ['--threshold', '8', '--level', 'notice'], {}, function() {
		it('should respond with an exit code of `2`', function() {
			assert.strictEqual(this.lastExitCode, 2);
		});
	});

	describeCliCall('/manyerrors', ['--threshold', '6', '--level', 'warning'], {}, function() {
		it('should respond with an exit code of `0`', function() {
			assert.strictEqual(this.lastExitCode, 0);
		});
	});

	describeCliCall('/manyerrors', ['--threshold', '4', '--level', 'warning'], {}, function() {
		it('should respond with an exit code of `2`', function() {
			assert.strictEqual(this.lastExitCode, 2);
		});
	});

});

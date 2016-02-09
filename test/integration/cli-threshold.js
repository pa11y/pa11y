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

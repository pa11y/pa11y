/* jshint maxstatements: false */
/* global describe, it */
// jscs:disable maximumLineLength
'use strict';

var assert = require('proclaim');
var describeCliCall = require('./helper/describe-cli-call');

describe('Pa11y CLI Timeout', function () {

	describeCliCall('/notices', ['--timeout', '5'], {}, function () {

		it('should respond with an exit code of `1`', function () {
			assert.strictEqual(this.lastExitCode, 1);
		});

		it('should respond with the expected output', function () {
			assert.include(this.lastStderr, 'Test function errored for "http://localhost:' + this.port + '/notices"');
			assert.include(this.lastStderr, 'Error: Pa11y timed out');
		});

	});

	describeCliCall('/notices', ['--config', './mock/config/timeout.json'], {}, function () {

		it('should respond with an exit code of `1`', function () {
			assert.strictEqual(this.lastExitCode, 1);
		});

		it('should respond with the expected output', function () {
			assert.include(this.lastStderr, 'Test function errored for "http://localhost:' + this.port + '/notices"');
			assert.include(this.lastStderr, 'Error: Pa11y timed out');
		});

	});

});

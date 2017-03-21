'use strict';

var assert = require('proclaim');
var describeCliCall = require('./helper/describe-cli-call');

describe('Pa11y CLI environment', function() {

	describeCliCall('/', ['--environment'], {}, function() {

		it('should respond with an exit code of `0`', function() {
			assert.strictEqual(this.lastExitCode, 0);
		});

		it('should respond with the expected information', function() {
			assert.match(this.lastOutput, /pa11y:\s+\d+\.\d+\.\d+/i);
			assert.match(this.lastOutput, /node\.js:\s+\d+\.\d+\.\d+/i);
			assert.match(this.lastOutput, /npm:\s+\d+\.\d+\.\d+/i);
			assert.match(this.lastOutput, /phantomjs:\s+\d+\.\d+\.\d+/i);
			assert.match(this.lastOutput, /os:\s+[^(]+\s\([^)]+\)/i);
		});

	});

});

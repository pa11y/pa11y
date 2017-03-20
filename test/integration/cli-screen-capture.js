'use strict';

var assert = require('proclaim');
var describeCliCall = require('./helper/describe-cli-call');
var fs = require('fs');
var path = require('path');
var screenCapturePath = path.join(__dirname, '/tmp/test.png');

describe('Pa11y CLI Screen Capture', function() {

	describeCliCall('/notices', ['--screen-capture', screenCapturePath], {}, function() {

		after(function(done) {
			fs.unlink(screenCapturePath, done);
		});

		it('should respond with an exit code of `0`', function() {
			assert.strictEqual(this.lastExitCode, 0);
		});

		it('should save a screen capture to the expected file', function(done) {
			fs.stat(screenCapturePath, function(error, stats) {
				if (error) {
					return done(error);
				}
				assert.isTrue(stats.isFile());
				done();
			});
		});

	});

});

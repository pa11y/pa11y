
const assert = require('proclaim');
const describeCliCall = require('./helper/describe-cli-call');
const fs = require('fs');
const path = require('path');
const screenCaptureDirectory = path.join(__dirname, '/tmp');
const screenCapturePath = path.join(screenCaptureDirectory, '/test.png');

describe('Pa11y CLI Screen Capture', function() {

	before(function(done) {
		fs.mkdir(screenCaptureDirectory, () => {
			done();
		});
	});

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

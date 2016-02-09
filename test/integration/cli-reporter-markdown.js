// jshint maxstatements: false
// jscs:disable maximumLineLength
'use strict';

var assert = require('proclaim');
var describeCliCall = require('./helper/describe-cli-call');

describe('Pa11y CLI Reporter (Markdown)', function() {

	describeCliCall('/notices', ['--reporter', 'markdown'], {}, function() {

		it('should respond with an exit code of `0`', function() {
			assert.strictEqual(this.lastExitCode, 0);
		});

		it('should respond with the expected output', function() {
			assert.include(this.lastStdout, '# Welcome to Pa11y\n\n## Results for localhost:3131/notices:\n* __Notice:__ Check that the title element describes the document.\n * WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2\n * html > head > title\n * `<title>Page Title</title>`\n\n\n## Summary:\n* 0 Errors\n* 0 Warnings\n* 1 Notices\n');
		});

	});

});

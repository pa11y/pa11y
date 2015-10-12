// jshint maxstatements: false
// jscs:disable maximumLineLength
'use strict';

var assert = require('proclaim');
var describeCliCall = require('./helper/describe-cli-call');

describe('Pa11y CLI Reporter (CSV)', function() {

	describeCliCall('/notices', ['--reporter', 'csv'], {}, function() {

		it('should respond with an exit code of `0`', function() {
			assert.strictEqual(this.lastExitCode, 0);
		});

		it('should respond with the expected output', function() {
			assert.include(this.lastStdout, '"type","code","message","context","selector"\n"notice","WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2","Check that the title element describes the document.","<title>Page Title</title>","html > head > title"');
		});

	});

});

// jshint maxstatements: false
// jscs:disable maximumLineLength
'use strict';

var assert = require('proclaim');
var describeCliCall = require('./helper/describe-cli-call');

describe('Pa11y CLI Reporter (JSON)', function() {

	describeCliCall('/notices', ['--reporter', 'json'], {}, function() {

		it('should respond with an exit code of `0`', function() {
			assert.strictEqual(this.lastExitCode, 0);
		});

		it('should respond with the expected output', function() {
			assert.include(this.lastStdout, '[{"code":"WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2","context":"<title>Page Title</title>","message":"Check that the title element describes the document.","selector":"html > head > title","type":"notice","typeCode":3}]');
		});

	});

});

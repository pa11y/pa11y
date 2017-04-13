'use strict';

var assert = require('proclaim');
var describeCliCall = require('./helper/describe-cli-call');

describe('Pa11y CLI Reporter (TSV)', function() {

	describeCliCall('/notices', ['--reporter', 'tsv'], {}, function() {

		it('should respond with an exit code of `0`', function() {
			assert.strictEqual(this.lastExitCode, 0);
		});

		it('should respond with the expected output', function() {
			assert.include(this.lastStdout, 'type\tcode\tmessage\tcontext\tselector\n"notice"\t"WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2"\t"Check that the title element describes the document."\t"<title>Page Title</title>"\t"html > head > title"');
		});

	});

});

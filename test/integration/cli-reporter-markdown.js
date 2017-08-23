
const assert = require('proclaim');
const describeCliCall = require('./helper/describe-cli-call');

describe('Pa11y CLI Reporter (Markdown)', function() {

	describeCliCall('/notices', ['--reporter', 'markdown'], {}, function() {

		it('should respond with an exit code of `0`', function() {
			assert.strictEqual(this.lastExitCode, 0);
		});

		it('should respond with the expected output', function() {
			assert.include(this.lastStdout, `# Welcome to Pa11y

				## Results for http://localhost:${this.port}/notices:

				* __Notice:__ Check that the title element describes the document.
				 * WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2
				 * html > head > title
				 * \`<title>Page Title</title>\`

				## Summary:
				* 0 Errors
				* 0 Warnings
				* 1 Notices

			`.replace(/\t+/g, ''));
		});

	});

});

'use strict';

var assert = require('proclaim');
var describeCliCall = require('./helper/describe-cli-call');

describe('Pa11y CLI Level', function() {

	describeCliCall('/notices', ['--level', 'notice'], {}, function() {

		it('should respond with an exit code of `2`', function() {
			assert.strictEqual(this.lastExitCode, 2);
		});

		it('should respond with the expected messages', function() {
			assert.isArray(this.lastJsonResponse);
			assert.lengthEquals(this.lastJsonResponse, 1);
			assert.deepEqual(this.lastJsonResponse[0], {
				code: 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2',
				context: '<title>Page Title</title>',
				message: 'Check that the title element describes the document.',
				selector: 'html > head > title',
				type: 'notice',
				typeCode: 3
			});
		});

	});

	describeCliCall('/warnings', ['--level', 'warning'], {}, function() {

		it('should respond with an exit code of `2`', function() {
			assert.strictEqual(this.lastExitCode, 2);
		});

		it('should respond with the expected messages', function() {
			assert.isArray(this.lastJsonResponse);
			assert.lengthEquals(this.lastJsonResponse, 2);
			assert.deepEqual(this.lastJsonResponse[0], {
				code: 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2',
				context: '<title>Page Title</title>',
				message: 'Check that the title element describes the document.',
				selector: 'html > head > title',
				type: 'notice',
				typeCode: 3
			});
			assert.deepEqual(this.lastJsonResponse[1], {
				code: 'WCAG2AA.Principle1.Guideline1_3.1_3_1.H42',
				context: '<p><b>Hello World!</b></p>',
				message: 'Heading markup should be used if this content is intended as a heading.',
				selector: 'html > body > p',
				type: 'warning',
				typeCode: 2
			});
		});

	});

	describeCliCall('/errors', ['--level', 'none'], {}, function() {

		it('should respond with an exit code of `0`', function() {
			assert.strictEqual(this.lastExitCode, 0);
		});

		it('should respond with the expected messages', function() {
			assert.isArray(this.lastJsonResponse);
			assert.lengthEquals(this.lastJsonResponse, 3);
			assert.deepEqual(this.lastJsonResponse[0], {
				code: 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2',
				context: '<title>Page Title</title>',
				message: 'Check that the title element describes the document.',
				selector: 'html > head > title',
				type: 'notice',
				typeCode: 3
			});
			assert.deepEqual(this.lastJsonResponse[1], {
				code: 'WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2',
				context: '<html><head>\n\n\t<meta charset="utf-8">...</html>',
				message: 'The html element should have a lang or xml:lang attribute which describes the language of the document.',
				selector: 'html',
				type: 'error',
				typeCode: 1
			});
			assert.deepEqual(this.lastJsonResponse[2], {
				code: 'WCAG2AA.Principle1.Guideline1_3.1_3_1.H42',
				context: '<p><b>Hello World!</b></p>',
				message: 'Heading markup should be used if this content is intended as a heading.',
				selector: 'html > body > p',
				type: 'warning',
				typeCode: 2
			});
		});

	});

});

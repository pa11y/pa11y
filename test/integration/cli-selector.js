'use strict';

var assert = require('proclaim');
var describeCliCall = require('./helper/describe-cli-call');

describe('Pa11y CLI Selectors', function() {

	describeCliCall('/selectors', [], {}, function() {

		it('should respond with an exit code of `2`', function() {
			assert.strictEqual(this.lastExitCode, 2);
		});

		it('should respond with the expected messages', function() {
			assert.isArray(this.lastJsonResponse);
			assert.lengthEquals(this.lastJsonResponse, 5);
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
				selector: 'html > body > p:nth-child(1)',
				type: 'warning',
				typeCode: 2
			});
			assert.deepEqual(this.lastJsonResponse[3], {
				code: 'WCAG2AA.Principle1.Guideline1_1.1_1_1.H67.2',
				context: '<img alt="">',
				message: 'Img element is marked so that it is ignored by Assistive Technology.',
				selector: '#foo > img',
				type: 'warning',
				typeCode: 2
			});
			assert.deepEqual(this.lastJsonResponse[4], {
				code: 'WCAG2AA.Principle1.Guideline1_1.1_1_1.G73,G74',
				context: '<img alt="">',
				message: 'If this image cannot be fully described in a short text alternative, ensure a long text alternative is also available, such as in the body text or through a link.',
				selector: '#foo > img',
				type: 'notice',
				typeCode: 3
			});
		});

	});

});

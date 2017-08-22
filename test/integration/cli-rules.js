'use strict';

var assert = require('proclaim');
var describeCliCall = require('./helper/describe-cli-call');

describe('Pa11y CLI Add Rule', function() {

	describeCliCall('/heading-errors', ['--add-rule', 'Principle1.Guideline1_3.1_3_1_AAA', '--ignore', 'notice;warning'], {}, function() {

		it('should respond with an exit code of `2`', function() {
			assert.strictEqual(this.lastExitCode, 2);
		});

		it('should respond with the expected messages', function() {
			assert.isArray(this.lastJsonResponse);
			assert.lengthEquals(this.lastJsonResponse, 1);
			assert.deepEqual(this.lastJsonResponse[0], {
				code: 'WCAG2AA.Principle1.Guideline1_3.1_3_1_AAA.G141',
				context: '<h4>The order is wrong</h4>',
				message: 'The heading structure is not logically nested. This h4 element should be an h2 to be properly nested.',
				selector: 'html > body > h4',
				type: 'error',
				typeCode: 1
			});
		});
	});

	describeCliCall('/heading-errors', ['--add-rule', 'Principle1.Guideline1_3.1_3_1_AA'], {}, function() {

		it('should respond with an exit code of `1`', function() {
			assert.strictEqual(this.lastExitCode, 1);
		});

		it('should respond with an error message', function() {
			assert.isObject(this.lastJsonResponse);
		});
	});

	describeCliCall('/heading-errors', ['--add-rule', 'Principle1.Guideline1_3.1_3_1_AAA', '--standard', 'Section508'], {}, function() {

		it('should respond with an exit code of `2`', function() {
			assert.strictEqual(this.lastExitCode, 2);
		});

		it('should respond with the expected messages', function() {
			assert.isArray(this.lastJsonResponse);
			assert.lengthEquals(this.lastJsonResponse, 1);
			assert.deepEqual(this.lastJsonResponse[0], {
				code: 'Section508.D.HeadingOrder',
				context: '<h4>The order is wrong</h4>',
				message: 'The heading structure is not logically nested. This h4 element should be an h2 to be properly nested.',
				selector: 'html > body > h4',
				type: 'error',
				typeCode: 1
			});
		});
	});
});

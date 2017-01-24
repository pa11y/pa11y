'use strict';

var assert = require('proclaim');
var describeCliCall = require('./helper/describe-cli-call');

describe('Pa11y CLI Actions', function() {

	describeCliCall('/toggle', ['--config', './mock/config/actions-wait-fragment.json'], {}, function() {

		it('should respond with the expected messages', function() {
			assert.isArray(this.lastJsonResponse);
			assert.lengthEquals(this.lastJsonResponse, 1);
			assert.deepEqual(this.lastJsonResponse[0], {
				code: 'WCAG2AA.Principle1.Guideline1_1.1_1_1.H37',
				context: '<img src="bad">',
				message: 'Img element missing an alt attribute. Use the alt attribute to specify a short text alternative.',
				selector: '#target > img',
				type: 'error',
				typeCode: 1
			});
		});

	});

	describeCliCall('/link', ['--config', './mock/config/actions-wait-path.json'], {}, function() {

		it('should respond with the expected messages', function() {
			assert.isArray(this.lastJsonResponse);
			assert.lengthEquals(this.lastJsonResponse, 0);
		});

	});

});

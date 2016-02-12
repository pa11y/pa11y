// jshint maxstatements: false
// jscs:disable maximumLineLength
'use strict';

var assert = require('proclaim');
var describeCliCall = require('./helper/describe-cli-call');

describe('Pa11y CLI Hide Elements', function() {

	describeCliCall('/hide-elements', ['--hide-elements', '.heading'], {}, function() {

		it('should respond with an exit code of `0`', function() {
			assert.strictEqual(this.lastExitCode, 0);
		});

		it('should respond with the expected messages', function() {
			assert.isArray(this.lastJsonResponse);
			assert.strictEqual(this.lastJsonResponse.length, 3);
			assert.notStrictEqual(this.lastJsonResponse[0].type, 'error');
			assert.notStrictEqual(this.lastJsonResponse[1].type, 'error');
			assert.notStrictEqual(this.lastJsonResponse[2].type, 'error');
		});

	});
});

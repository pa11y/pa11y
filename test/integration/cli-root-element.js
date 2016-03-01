// jshint maxstatements: false
// jscs:disable maximumLineLength
'use strict';

var assert = require('proclaim');
var describeCliCall = require('./helper/describe-cli-call');

describe('Pa11y CLI Root Element', function() {

	describeCliCall('/root-element', ['--root-element', '#core'], {}, function() {

		it('should respond with an exit code of `2`', function() {
			assert.strictEqual(this.lastExitCode, 2);
		});

		it('should respond with the expected messages', function() {
			assert.isArray(this.lastJsonResponse);
			assert.strictEqual(this.lastJsonResponse.length, 2);
			assert.match(this.lastJsonResponse[0].selector, /^#core/);
			assert.match(this.lastJsonResponse[1].selector, /^#core/);
		});

	});
});

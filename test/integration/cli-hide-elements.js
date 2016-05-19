// jshint maxstatements: false
// jscs:disable maximumLineLength
'use strict';

var assert = require('proclaim');
var describeCliCall = require('./helper/describe-cli-call');

describe('Pa11y CLI Hide Elements', function() {

	describeCliCall('/hide-elements', ['--hide-elements', '#hide-parent', '--ignore', 'warning;notice'], {}, function() {

		it('should respond with an exit code of `0`', function() {
			assert.strictEqual(this.lastExitCode, 0);
		});

		it('should respond with no errors', function() {
			assert.isArray(this.lastJsonResponse);
			assert.strictEqual(this.lastJsonResponse.length, 0);
		});

	});

	describeCliCall('/hide-elements', ['--hide-elements', 'h1,h2,img,iframe,#para,form,input', '--ignore', 'warning;notice'], {}, function() {

		it('should respond with an exit code of `2`', function() {
			assert.strictEqual(this.lastExitCode, 2);
		});

		it('should respond with the visible elements error messages', function() {
			assert.isArray(this.lastJsonResponse);
			assert.strictEqual(this.lastJsonResponse.length, 2);
			assert.strictEqual(this.lastJsonResponse[0].context.match(/^(<h1|<h2|<img|<iframe|id="para|<form|<input")/), null);
			assert.strictEqual(this.lastJsonResponse[1].context.match(/^(<h1|<h2|<img|<iframe|id="para|<form|<input")/), null);
		});

	});
});

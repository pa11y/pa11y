/* jshint maxlen: 200, maxstatements: 20 */
/* global describe, it */
'use strict';

var assert = require('proclaim');
var sinon = require('sinon');

describe('sniff/handle-result', function () {
	var handleResult = require('../../../lib/sniff/handle-result');

	it('should be a function', function () {
		assert.isFunction(handleResult);
	});

	it('should have a sanitizeMessages function', function () {
		assert.isFunction(handleResult.sanitizeMessages);
	});

	it('should indicate a perfect result', function (done) {
		handleResult([], function (err, results) {
			assert.isTrue(results.isPerfect);
			done();
		});
	});

	it('should include an array of messages', function (done) {
		handleResult([], function (err, results) {
			assert.isArray(results.results);
			done();
		});
	});

	it('should provide the correct counts of message types', function (done) {
		handleResult([
			{type: 1},
			{type: 1},
			{type: 2},
			{type: 2},
			{type: 2}
		], function (err, results) {
			assert.strictEqual(results.count.total, 5);
			assert.strictEqual(results.count.error, 2);
			assert.strictEqual(results.count.warning, 3);
			assert.strictEqual(results.count.notice, 0);
			done();
		});
	});

	it('should sanitize the messages', function (done) {
		var messages = [];
		sinon.spy(handleResult, 'sanitizeMessages');
		handleResult(messages, function () {
			assert.isTrue(handleResult.sanitizeMessages.withArgs(messages).calledOnce);
			handleResult.sanitizeMessages.restore();
			done();
		});
	});

	describe('.sanitizeMessages()', function () {

		it('should return an empty array when called with a non-array messages object', function () {
			assert.deepEqual(handleResult.sanitizeMessages('foo'), []);
		});

		it('should transform messages as expected', function () {
			var rawMessages = [
				{code: 12, msg: 'foo', type: 1},
				{code: 34, msg: 'bar', type: 2},
				{code: 56, msg: 'baz', type: 3},
				{code: 78, msg: 'qux', type: 4}
			];
			var expectedMessages = [
				{code: 12, message: 'foo', type: 'error'},
				{code: 34, message: 'bar', type: 'warning'},
				{code: 56, message: 'baz', type: 'notice'},
				{code: 78, message: 'qux', type: 'unknown'}
			];
			var sanitizedMessages = handleResult.sanitizeMessages(rawMessages);
			assert.deepEqual(sanitizedMessages[0], expectedMessages[0]);
		});

	});

});

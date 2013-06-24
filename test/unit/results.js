/* jshint maxlen: 200 */
/* global afterEach, beforeEach, describe, it */
'use strict';

var assert = require('proclaim');
var sinon = require('sinon');

describe('results', function () {
	var results = require('../../lib/results');

	describe('.sanitizeMessages()', function () {

		it('should return an empty array when called with a non-array messages object', function () {
			assert.deepEqual(results.sanitizeMessages('foo'), []);
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
			var sanitizedMessages = results.sanitizeMessages(rawMessages);
			assert.deepEqual(sanitizedMessages[0], expectedMessages[0]);
		});

	});

	describe('.build()', function () {

		beforeEach(function () {
			sinon.spy(results, 'sanitizeMessages');
		});

		afterEach(function () {
			results.sanitizeMessages.restore();
		});

		it('should indicate a perfect result', function () {
			assert.isTrue(results.build([]).isPerfect);
			assert.isFalse(results.build([{}, {}, {}]).isPerfect);
		});

		it('should include an array of results', function () {
			assert.isArray(results.build([]).results);
		});

		it('should provide the correct counts of message types', function () {
			var res = results.build([
				{type: 1},
				{type: 1},
				{type: 2},
				{type: 2},
				{type: 2},
				{type: 3}
			]);
			assert.strictEqual(res.count.total, 6);
			assert.strictEqual(res.count.error, 2);
			assert.strictEqual(res.count.warning, 3);
			assert.strictEqual(res.count.notice, 1);
		});

		it('should sanitize the messages', function () {
			var messages = [];
			results.build(messages);
			assert.isTrue(results.sanitizeMessages.withArgs(messages).calledOnce);
		});

	});

});

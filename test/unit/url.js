/* jshint maxlen: 200 */
/* global describe, it */
'use strict';

var assert = require('proclaim');

var testUrls = [
	{input: 'nature.com', output: 'http://nature.com'},
	{input: 'http://nature.com/', output: 'http://nature.com/'},
	{input: 'https://nature.com/foo/bar?baz=qux#quux', output: 'https://nature.com/foo/bar?baz=qux#quux'}
];

describe('url', function () {
	var url = require('../../lib/url');

	it('should be an object', function () {
		assert.isObject(url);
	});

	it('should have a sanitize function', function () {
		assert.isFunction(url.sanitize);
	});

	describe('.sanitize()', function () {

		it('should transform URLs as expected', function () {
			testUrls.forEach(function (u) {
				assert.strictEqual(url.sanitize(u.input), u.output);
			});
		});

	});

});

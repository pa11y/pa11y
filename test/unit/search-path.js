/* global describe, it */
'use strict';

var assert = require('proclaim');

describe('searchPath()', function () {
	var searchPath = require('../../lib/search-path');
	it('should be a function', function () {
		assert.isFunction(searchPath);
	});
	it('should not find foo, bar, or baz', function () {
		searchPath(['foo', 'bar', 'baz'], function (found) {
			assert.isFalse(found);
		});
	});
	it('should find PhantomJS', function () {
		searchPath(['phantomjs', 'phantomjs.exe'], function (found) {
			assert.isTrue(found);
		});
	});
});

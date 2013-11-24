/* global afterEach, beforeEach, describe, it */
'use strict';

var assert = require('proclaim');
var mockery = require('mockery');

describe('searchPath()', function () {
	var searchPath;
	beforeEach(function () {
		mockery.enable({
			useCleanCache: true,
			warnOnUnregistered: false,
			warnOnReplace: false
		});
		mockery.registerMock('path', {
			'sep': '/',
			'delimiter': ':'
		});
		mockery.registerMock('fs', {
			existsSync: function (filename) {
				switch (filename) {
					case '/usr/bin/bar':
					case '/opt/local/bin/phantomjs':
						return true;
					default:
						return false;
				}
			}
		});
		searchPath = require('../../lib/search-path');
	});
	afterEach(function () {
		mockery.disable();
	});
	it('should be a function', function () {
		assert.isFunction(searchPath);
	});
	it('should find bar', function () {
		searchPath('/usr/local/bin:/usr/bin:/bin', ['foo', 'bar', 'baz'], function (found) {
			assert.isTrue(found);
		});
	});
	it('should not find tcsh or Bash', function () {
		searchPath('/usr/local/bin:/usr/bin:/bin', ['csh', 'bash'], function (found) {
			assert.isFalse(found);
		});
	});
	it('should find PhantomJS', function () {
		searchPath('/opt/local/bin', ['phantomjs'], function (found) {
			assert.isTrue(found);
		});
	});
});

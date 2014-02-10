// This file is part of pa11y.
// 
// pa11y is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// pa11y is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with pa11y.  If not, see <http://www.gnu.org/licenses/>.

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

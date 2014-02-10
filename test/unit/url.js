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

/* jshint maxlen: 200, maxstatements: 20 */
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

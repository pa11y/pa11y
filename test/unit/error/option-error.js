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

describe('error/option-error', function () {
	var OptionError = require('../../../lib/error/option-error');

	it('should be a function', function () {
		assert.isFunction(OptionError);
	});

	it('should extend Error', function () {
		assert.isInstanceOf(new OptionError(), Error);
	});

	it('should have the message property set', function () {
		var err = new OptionError('foo');
		assert.strictEqual(err.message, 'foo');
	});

});

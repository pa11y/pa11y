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

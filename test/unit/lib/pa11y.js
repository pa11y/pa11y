/* jshint maxstatements: false, maxlen: false */
/* global beforeEach, describe, it */
'use strict';

var assert = require('proclaim');

describe('lib/pa11y', function () {
	var pa11y;

	beforeEach(function () {
		pa11y = require('../../../lib/pa11y');
	});

	it('should be a function', function () {
		assert.isFunction(pa11y);
	});

});

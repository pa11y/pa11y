/* jshint maxstatements: false, maxlen: false */
/* global afterEach, beforeEach */
'use strict';

var mockery = require('mockery');

beforeEach(function () {
	mockery.enable({
		useCleanCache: true,
		warnOnUnregistered: false,
		warnOnReplace: false
	});
});

afterEach(function () {
	mockery.deregisterAll();
	mockery.disable();
});

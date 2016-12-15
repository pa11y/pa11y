'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var sinon = require('sinon');

sinon.assert.expose(assert, {
	includeFail: false,
	prefix: ''
});

beforeEach(function() {
	mockery.enable({
		useCleanCache: true,
		warnOnUnregistered: false,
		warnOnReplace: false
	});
});

afterEach(function() {
	mockery.deregisterAll();
	mockery.disable();
});

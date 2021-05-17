'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

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

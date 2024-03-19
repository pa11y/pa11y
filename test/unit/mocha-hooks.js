'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

sinon.assert.expose(assert, {
	includeFail: false,
	prefix: ''
});

module.exports = {
	mochaHooks: {
		beforeEach() {
			mockery.enable({
				useCleanCache: true,
				warnOnUnregistered: false,
				warnOnReplace: false
			});
		},
		afterEach() {
			mockery.deregisterAll();
			mockery.disable();
		}
	}
};

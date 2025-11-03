'use strict';

const assert = require('proclaim');
const quibble = require('quibble');
const sinon = require('sinon');

sinon.assert.expose(assert, {
	includeFail: false,
	prefix: ''
});

module.exports = {
	mochaHooks: {
		beforeEach() {
			// Clear the require cache before each test so quibble can intercept fresh requires
			Object.keys(require.cache).forEach(key => {
				if (!key.includes('node_modules')) {
					delete require.cache[key];
				}
			});
		},
		afterEach() {
			quibble.reset();
		}
	}
};

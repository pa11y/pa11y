/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');

describe('pa11y-ci (with URLs defined as objects)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'url-objects'
		]);
	});

	it('exits with 0', () => {
		assert.strictEqual(global.lastResult.code, 0);
	});

	it('outputs a result notice for each URL', () => {
		assert.include(global.lastResult.output, 'http://localhost:8090/passing-1 - 0 errors');
		assert.include(global.lastResult.output, 'http://localhost:8090/passing-2 - 0 errors');
	});

});

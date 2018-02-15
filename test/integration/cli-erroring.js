/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');

describe('pa11y-ci (with a single erroring URL)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'erroring-single'
		]);
	});

	it('exits with 2', () => {
		assert.strictEqual(global.lastResult.code, 2);
	});

	it('outputs a result notice for each URL', () => {
		assert.include(global.lastResult.output, 'http://notahost:8090/erroring-1 - Failed to run');
	});

	it('outputs error information', () => {
		assert.include(global.lastResult.output, 'Errors in http://notahost:8090/erroring-1');
		assert.include(global.lastResult.output, 'net::ERR_NAME_NOT_RESOLVED');
	});

	it('outputs a total erroring notice', () => {
		assert.include(global.lastResult.output, '0/1 URLs passed');
	});

});

describe('pa11y-ci (with multiple erroring URLs)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'erroring-multiple'
		]);
	});

	it('exits with 2', () => {
		assert.strictEqual(global.lastResult.code, 2);
	});

	it('outputs a result notice for each URL', () => {
		assert.include(global.lastResult.output, 'http://notahost:8090/erroring-1 - Failed to run');
		assert.include(global.lastResult.output, 'http://localhost:8090/timeout - Failed to run');
	});

	it('outputs error information', () => {
		assert.include(global.lastResult.output, 'Errors in http://notahost:8090/erroring-1');
		assert.include(global.lastResult.output, 'net::ERR_NAME_NOT_RESOLVED');
		assert.include(global.lastResult.output, 'Errors in http://localhost:8090/timeout');
		assert.include(global.lastResult.output, 'timed out');
	});

	it('outputs a total erroring notice', () => {
		assert.include(global.lastResult.output, '0/2 URLs passed');
	});

});

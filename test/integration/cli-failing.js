/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');

describe('pa11y-ci (with a single failing URL)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'failing-single'
		]);
	});

	it('exits with 2', () => {
		assert.strictEqual(global.lastResult.code, 2);
	});

	it('outputs a result notice for each URL', () => {
		assert.include(global.lastResult.output, 'http://localhost:8090/failing-1 - 1 errors');
	});

	it('outputs error information', () => {
		assert.include(global.lastResult.output, 'Errors in http://localhost:8090/failing-1');
		assert.include(global.lastResult.output, 'html element should have a lang');
	});

	it('outputs a total failing notice', () => {
		assert.include(global.lastResult.output, '0/1 URLs passed');
	});

});

describe('pa11y-ci (with multiple failing URLs)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'failing-multiple'
		]);
	});

	it('exits with 2', () => {
		assert.strictEqual(global.lastResult.code, 2);
	});

	it('outputs a result notice for each URL', () => {
		assert.include(global.lastResult.output, 'http://localhost:8090/failing-1 - 1 errors');
		assert.include(global.lastResult.output, 'http://localhost:8090/failing-2 - 1 errors');
	});

	it('outputs error information', () => {
		assert.include(global.lastResult.output, 'Errors in http://localhost:8090/failing-1');
		assert.include(global.lastResult.output, 'html element should have a lang');
		assert.include(global.lastResult.output, 'Errors in http://localhost:8090/failing-2');
		assert.include(global.lastResult.output, 'title element in the head');
	});

	it('outputs a total failing notice', () => {
		assert.include(global.lastResult.output, '0/2 URLs passed');
	});

});

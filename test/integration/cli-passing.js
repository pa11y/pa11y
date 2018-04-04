/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');

describe('pa11y-ci (with a single passing URL)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'passing-single'
		]);
	});

	it('exits with 0', () => {
		assert.strictEqual(global.lastResult.code, 0);
	});

	it('outputs a result notice for each URL', () => {
		assert.include(global.lastResult.output, 'http://localhost:8090/passing-1 - 0 errors');
	});

	it('outputs a total passing notice', () => {
		assert.include(global.lastResult.output, '1/1 URLs passed');
	});

});

describe('pa11y-ci (with multiple passing URLs)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'passing-multiple'
		]);
	});

	it('exits with 0', () => {
		assert.strictEqual(global.lastResult.code, 0);
	});

	it('outputs a result notice for each URL', () => {
		assert.include(global.lastResult.output, 'http://localhost:8090/passing-1 - 0 errors');
		assert.include(global.lastResult.output, 'http://localhost:8090/passing-2 - 0 errors');
	});

	it('outputs a total passing notice', () => {
		assert.include(global.lastResult.output, '2/2 URLs passed');
	});

});

describe('pa11y-ci (with URLs passing due to threshold)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'passing-threshold'
		]);
	});

	it('exits with 0', () => {
		assert.strictEqual(global.lastResult.code, 0);
	});

	it('outputs a result notice for each URL', () => {
		assert.include(global.lastResult.output, 'http://localhost:8090/failing-1 - 1 errors (within threshold of 1)');
	});

	it('outputs a total passing notice', () => {
		assert.include(global.lastResult.output, '1/1 URLs passed');
	});

});

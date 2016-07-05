// jscs:disable maximumLineLength
'use strict';

const assert = require('proclaim');

describe('pa11y-ci (with a sitemap)', () => {

	before(() => {
		return global.cliCall([
			'--sitemap',
			'http://localhost:8090/sitemap.xml',
			'--config',
			'empty'
		]);
	});

	it('loads the expected sitemap', () => {
		assert.include(global.lastResult.output, 'http://localhost:8090/passing-1');
		assert.include(global.lastResult.output, 'http://localhost:8090/failing-1');
	});

});

describe('pa11y-ci (with a sitemap that can\'t be loaded)', () => {

	before(() => {
		return global.cliCall([
			'--sitemap',
			'http://notahost:8090/sitemap.xml',
			'--config',
			'empty'
		]);
	});

	it('exits with 1', () => {
		assert.strictEqual(global.lastResult.code, 1);
	});

	it('outputs an error message', () => {
		assert.include(global.lastResult.output, 'http://notahost:8090/sitemap.xml');
		assert.include(global.lastResult.output, 'could not be loaded');
	});

});

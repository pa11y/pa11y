/* eslint max-len: 'off' */
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
		assert.include(global.lastResult.output, 'http://localhost:8090/excluded');
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

describe('pa11y-ci (with a sitemap and find/replace)', () => {

	before(() => {
		return global.cliCall([
			'--sitemap',
			'http://localhost:8090/sitemap.xml',
			'--sitemap-find',
			'LOCALHOST',
			'--sitemap-replace',
			'127.0.0.1',
			'--config',
			'empty'
		]);
	});

	it('loads the expected sitemap and performs a find/replace on the URLs', () => {
		assert.include(global.lastResult.output, 'http://127.0.0.1:8090/passing-1');
		assert.include(global.lastResult.output, 'http://127.0.0.1:8090/failing-1');
		assert.include(global.lastResult.output, 'http://127.0.0.1:8090/excluded');
	});

});

describe('pa11y-ci (with a sitemap and sitemap-exclude)', () => {

	before(() => {
		return global.cliCall([
			'--sitemap',
			'http://localhost:8090/sitemap.xml',
			'--sitemap-exclude',
			'EXCLUDED',
			'--config',
			'empty'
		]);
	});

	it('loads the expected sitemap without the excluded URLs', () => {
		assert.include(global.lastResult.output, 'http://localhost:8090/passing-1');
		assert.include(global.lastResult.output, 'http://localhost:8090/failing-1');
		assert.doesNotInclude(global.lastResult.output, 'http://localhost:8090/excluded');
	});

});

describe('pa11y-ci (with a sitemap being sitemapindex)', () => {

	before(() => {
		return global.cliCall([
			'--sitemap',
			'http://localhost:8090/sitemapindex.xml',
			'--config',
			'empty'
		]);
	});

	it('loads the expected urls from multiple sitemaps', () => {
		assert.include(global.lastResult.output, 'http://localhost:8090/passing-1');
		assert.include(global.lastResult.output, 'http://localhost:8090/failing-1');
		assert.include(global.lastResult.output, 'http://localhost:8090/excluded');
		assert.include(global.lastResult.output, 'http://localhost:8090/passing-2');
	});

});

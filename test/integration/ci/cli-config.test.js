/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');

describe('pa11y-ci (with no config file)', () => {

	before(() => {
		return global.cliCall();
	});

	it('loads the expected config', () => {
		assert.include(global.lastResult.output, 'http://localhost:8090/config-default');
	});

});

describe('pa11y-ci (with a config file that has no extension)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'extension-none'
		]);
	});

	it('loads the expected config', () => {
		assert.include(global.lastResult.output, 'http://localhost:8090/config-extension-none');
	});

});

describe('pa11y-ci (with a config file that has a "json" extension)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'extension-json'
		]);
	});

	it('loads the expected config', () => {
		assert.include(global.lastResult.output, 'http://localhost:8090/config-extension-json');
	});

});

describe('pa11y-ci (with a config file that has a "js" extension)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'extension-js'
		]);
	});

	it('loads the expected config', () => {
		assert.include(global.lastResult.output, 'http://localhost:8090/config-extension-js');
	});

});

describe('pa11y-ci (with a config file that has a "js" extension that returns a promise)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'extension-js-promise'
		]);
	});

	it('loads the expected config', () => {
		assert.include(global.lastResult.output, 'http://localhost:8090/config-extension-js-promise');
	});

});

describe('pa11y-ci (with a config file that has a specified JSON extension)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'extension-json.json'
		]);
	});

	it('loads the expected config', () => {
		assert.include(global.lastResult.output, 'http://localhost:8090/config-extension-json');
	});

});

describe('pa11y-ci (with a config file that has a specified JS extension)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'extension-js.js'
		]);
	});

	it('loads the expected config', () => {
		assert.include(global.lastResult.output, 'http://localhost:8090/config-extension-js');
	});

});

describe('pa11y-ci (with a config file that has an absolute path)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			`${__dirname}/mock/config/extension-json.json`
		]);
	});

	it('loads the expected config', () => {
		assert.include(global.lastResult.output, 'http://localhost:8090/config-extension-json');
	});

});

describe('pa11y-ci (with a config file that has no extension and syntax errors)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'syntax-errors'
		]);
	});

	it('exits with 1', () => {
		assert.strictEqual(global.lastResult.code, 1);
	});

	it('outputs an error message', () => {
		assert.include(global.lastResult.output, 'There was a problem loading');
		assert.include(global.lastResult.output, 'syntax-errors');
	});

});

describe('pa11y-ci (with a config file that has a "json" extension and syntax errors)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'syntax-errors-json'
		]);
	});

	it('exits with 1', () => {
		assert.strictEqual(global.lastResult.code, 1);
	});

	it('outputs an error message', () => {
		assert.include(global.lastResult.output, 'There was a problem loading');
		assert.include(global.lastResult.output, 'syntax-errors-json');
	});

});

describe('pa11y-ci (with a config file that has a "js" extension and syntax errors)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'syntax-errors-js'
		]);
	});

	it('exits with 1', () => {
		assert.strictEqual(global.lastResult.code, 1);
	});

	it('outputs an error message', () => {
		assert.include(global.lastResult.output, 'There was a problem loading');
		assert.include(global.lastResult.output, 'syntax-errors-js');
	});

});

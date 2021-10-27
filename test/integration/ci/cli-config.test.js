/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');
const path = require('path');

describe('pa11y-ci (with no config file)', () => {

	before(() => {
		return global.cliCall();
	});

	it('loads the expected config', () => {
		assert.include(global.lastResult.output, `${global.mockWebsiteAddress}/config-default`);
	});

});

describe('pa11y-ci (with a config file that has no extension)', () => {
	it('loads the expected config', async () => {
		// TODO: refactor all tests to use async/await instead of a global state
		const result = await global.cliCall([
			'--config',
			'extension-none'
		]);

		assert.include(result.output, `${global.mockWebsiteAddress}/config-extension-none`);
	});

});

describe('pa11y-ci (with a config file that has a "json" extension)', () => {

	it('loads the expected config', async () => {
		const result = await global.cliCall([
			'--config',
			'extension-json'
		]);

		assert.include(result.output, `${global.mockWebsiteAddress}/config-extension-json`);
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
		assert.include(global.lastResult.output, `${global.mockWebsiteAddress}/config-extension-js`);
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
		assert.include(global.lastResult.output, `${global.mockWebsiteAddress}/config-extension-js-promise`);
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
		assert.include(global.lastResult.output, `${global.mockWebsiteAddress}/config-extension-json`);
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
		assert.include(global.lastResult.output, `${global.mockWebsiteAddress}/config-extension-js`);
	});

});

describe('pa11y-ci (with a config file that has an absolute path)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			path.resolve(`${__dirname}/../mock/config/extension-json.json`)
		]);
	});

	it('loads the expected config', () => {
		assert.include(global.lastResult.output, `${global.mockWebsiteAddress}/config-extension-json`);
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

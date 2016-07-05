// jscs:disable maximumLineLength
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

describe('pa11y-ci (with a config file that has a specified extension)', () => {

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

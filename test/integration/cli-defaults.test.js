/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');

describe('pa11y-ci (with default configurations set)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'defaults'
		]);
	});

	it('uses the default config for each URL', () => {
		assert.include(global.lastResult.output, 'http://localhost:8090/passing-1 - Failed to run');
		assert.include(global.lastResult.output, 'http://localhost:8090/passing-2 - Failed to run');
		assert.include(global.lastResult.output, 'timed out');
	});

});

describe('pa11y-ci (with default configurations and URL-specific overrides set)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'defaults-override'
		]);
	});

	it('overrides the default config', () => {
		assert.include(global.lastResult.output, 'http://localhost:8090/passing-1 - Failed to run');
		assert.include(global.lastResult.output, 'http://localhost:8090/passing-2 - 0 errors');
	});

});

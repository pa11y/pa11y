/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');

describe('pa11y-ci (with paths passed as args)', () => {
	before(() => {
		return global.cliCall([
			'--config',
			'defaults',
			'./foo/**/*.html'
		]);
	});

	it('uses the default config for each URL and path', () => {
		assert.include(global.lastResult.output, 'Running Pa11y on 3 URLs');
		assert.include(global.lastResult.output, 'foo/**/*.html');
		assert.strictEqual(global.lastResult.code, 2);
	});
});

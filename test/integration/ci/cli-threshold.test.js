/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');

describe('pa11y-ci (with the `-T` flag set above total errors)', () => {
	before(() => {
		return global.cliCall([
			'-T',
			'3',
			'--config',
			'threshold'
		]);
	});

	it('exit code is 0 with errors below threshold', () => {
		assert.strictEqual(global.lastResult.code, 0);
	});
});

describe('pa11y-ci (with the `-T` flag set at number of total errors)', () => {
	before(() => {
		return global.cliCall([
			'-T',
			'2',
			'--config',
			'threshold'
		]);
	});
	it('exit code is 0 with errors at threshold', () => {
		assert.strictEqual(global.lastResult.code, 0);
	});
});


describe('pa11y-ci (with the `-T` flag set below total errors)', () => {
	before(() => {
		return global.cliCall([
			'-T',
			'1',
			'--config',
			'threshold'
		]);
	});
	it('exit code is 2 with errors above threshold', () => {
		assert.strictEqual(global.lastResult.code, 2);
	});
});

describe('pa11y-ci (with no `-T` flag set)', () => {
	before(() => {
		return global.cliCall([
			'--config',
			'threshold'
		]);
	});
	it('exit code is 2 with errors when no threshold set', () => {
		assert.strictEqual(global.lastResult.code, 2);
	});
});

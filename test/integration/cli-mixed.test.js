/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');

describe('pa11y-ci (with erroring, failing, and passing URLs)', () => {

	before(() => {
		return global.cliCall([
			'--config',
			'mixed'
		]);
	});

	it('exits with 2', () => {
		assert.strictEqual(global.lastResult.code, 2);
	});

	it('outputs a result notice for each URL', () => {
		assert.include(global.lastResult.output, './foo/erroring.html - Failed to run');
		assert.include(global.lastResult.output, 'http://localhost:8090/failing-1 - 1 errors');
		assert.include(global.lastResult.output, 'http://localhost:8090/passing-1 - 0 errors');
	});

	it('outputs error information', () => {
		assert.include(global.lastResult.output, 'Errors in ./foo/erroring.html');
		assert.include(global.lastResult.output, 'net::ERR_FILE_NOT_FOUND');
		assert.include(global.lastResult.output, 'Errors in http://localhost:8090/failing-1');
		assert.include(global.lastResult.output, 'html element should have a lang');
		assert.notInclude(global.lastResult.output, 'Errors in ./foo/passing-1');
	});

	it('outputs a total failing notice', () => {
		assert.include(global.lastResult.output, '1/3 URLs passed');
	});

});

'use strict';

const assert = require('proclaim');
const path = require('path');
const quibble = require('quibble');

describe('lib/helpers', function() {
	let helpers;
	let requireFirst;

	beforeEach(function() {
		helpers = require('../../../lib/helpers');
		({requireFirst} = helpers);
	});

	it('is an object', function() {
		assert.isObject(helpers);
	});

	describe('.requireFirst(stack, defaultReturn)', function() {

		it('is a function', function() {
			assert.isFunction(requireFirst);
		});

		describe('when `stack` is empty', function() {

			it('returns `defaultReturn`', function() {
				const defaultReturn = {mockDefault: true};
				assert.strictEqual(requireFirst([], defaultReturn), defaultReturn);
			});

		});

		describe('when the first path in `stack` can be required', function() {
			let mockModule;
			let result;

			beforeEach(function() {
				mockModule = {mockModule: true};
				quibble('mock-first-module', mockModule);
				result = requireFirst(['mock-first-module'], {mockDefault: true});
			});

			it('returns the required module', function() {
				assert.strictEqual(result, mockModule);
			});

		});

		describe('when earlier paths in `stack` cannot be found', function() {
			let mockModule;
			let stack;
			let result;

			beforeEach(function() {
				mockModule = {mockModule: true};
				quibble('mock-second-module', mockModule);
				stack = [
					'mock-module-that-does-not-exist',
					'mock-second-module'
				];
				result = requireFirst(stack, {mockDefault: true});
			});

			it('skips them and returns the first module that can be required', function() {
				assert.strictEqual(result, mockModule);
			});

			it('removes the skipped paths from `stack` as it goes', function() {
				assert.deepEqual(stack, []);
			});

		});

		describe('when no path in `stack` can be found', function() {

			it('returns `defaultReturn`', function() {
				const defaultReturn = {mockDefault: true};
				const stack = [
					'mock-module-that-does-not-exist',
					'another-mock-module-that-does-not-exist'
				];
				assert.strictEqual(requireFirst(stack, defaultReturn), defaultReturn);
			});

		});

		describe('when the first path in `stack` throws an error other than `MODULE_NOT_FOUND`', function() {
			const throwingModulePath = path.join(__dirname, 'fixtures', 'helpers-throwing-module.js');
			let caughtError;

			beforeEach(function() {
				caughtError = undefined;
				try {
					requireFirst([throwingModulePath, 'mock-module-that-does-not-exist'], {});
				} catch (error) {
					caughtError = error;
				}
			});

			it('rethrows the error rather than trying the next path in `stack`', function() {
				assert.instanceOf(caughtError, Error);
				assert.strictEqual(caughtError.message, 'mock module load error');
			});

		});

	});

});

'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/reporters/json', () => {
	let bfj;
	let jsonReporter;

	beforeEach(() => {
		bfj = require('../../mock/bfj');
		mockery.registerMock('bfj', bfj);
		jsonReporter = require('../../../../lib/reporters/json');
	});

	it('is an object', () => {
		assert.isObject(jsonReporter);
	});

	it('has a `supports` property', () => {
		assert.isString(jsonReporter.supports);
	});

	it('has a `results` method', () => {
		assert.isFunction(jsonReporter.results);
	});

	describe('.results(pa11yResults)', () => {
		let mockResults;

		beforeEach(() => {
			mockResults = {
				issues: [
					'foo',
					'bar'
				]
			};
			jsonReporter.results(mockResults);
		});

		it('creates a BFJ stream', () => {
			assert.calledOnce(bfj.streamify);
			assert.calledWithExactly(bfj.streamify, mockResults.issues);
		});

		it('handles the stream `dataError` event', () => {
			assert.called(bfj.mockStream.on);
			assert.calledWith(bfj.mockStream.on, 'dataError');
			assert.isFunction(bfj.mockStream.on.withArgs('dataError').firstCall.args[1]);
		});

		describe('`dataError` handler', () => {
			let consoleErrorStub;
			let mockDataError;
			let processExitStub;

			beforeEach(() => {
				mockDataError = new Error('data error');
				consoleErrorStub = sinon.stub(console, 'error');
				processExitStub = sinon.stub(process, 'exit');
				bfj.mockStream.on.withArgs('dataError').firstCall.args[1](mockDataError);
				console.error.restore();
				process.exit.restore();
			});

			it('outputs the error stack to the console', () => {
				assert.calledOnce(consoleErrorStub);
				assert.calledWithExactly(consoleErrorStub, mockDataError.stack);
			});

			it('exits the process with a code of `1`', () => {
				assert.calledOnce(processExitStub);
				assert.calledWithExactly(processExitStub, 1);
			});

		});

		it('handles the stream `end` event', () => {
			assert.called(bfj.mockStream.on);
			assert.calledWith(bfj.mockStream.on, 'end');
			assert.isFunction(bfj.mockStream.on.withArgs('end').firstCall.args[1]);
		});

		describe('`end` handler', () => {
			let stdoutWriteStub;

			beforeEach(() => {
				stdoutWriteStub = sinon.stub(process.stdout, 'write');
				bfj.mockStream.on.withArgs('end').firstCall.args[1]();
				process.stdout.write.restore();
			});

			it('outputs a newline to STDOUT', () => {
				assert.calledOnce(stdoutWriteStub);
				assert.calledWithExactly(stdoutWriteStub, '\n');
			});

		});

		it('pipes the stream into `process.stdout`', () => {
			assert.calledOnce(bfj.mockStream.pipe);
			assert.calledWithExactly(bfj.mockStream.pipe, process.stdout);
		});

	});

	it('has an `error` method', () => {
		assert.isFunction(jsonReporter.error);
	});

	describe('.error(message)', () => {

		it('returns the message unchanged', () => {
			assert.strictEqual(jsonReporter.error('mock message'), 'mock message');
		});

	});

	it('does not have a `begin` method', () => {
		assert.isUndefined(jsonReporter.begin);
	});

	it('does not have a `debug` method', () => {
		assert.isUndefined(jsonReporter.debug);
	});

	it('does not have an `info` method', () => {
		assert.isUndefined(jsonReporter.info);
	});

});

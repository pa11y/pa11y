'use strict';

const assert = require('proclaim');
const quibble = require('quibble');
const sinon = require('sinon');

describe('lib/reporters/json', function() {
	let bfj;
	let jsonReporter;

	beforeEach(function() {
		bfj = require('../../mocks/bfj.mock');
		quibble('bfj', bfj);
		jsonReporter = require('../../../../lib/reporters/json');
	});

	it('is an object', function() {
		assert.isObject(jsonReporter);
	});

	it('has a `supports` property', function() {
		assert.isString(jsonReporter.supports);
	});

	it('has a `results` method', function() {
		assert.isFunction(jsonReporter.results);
	});

	describe('.results(pa11yResults)', function() {
		let mockResults;

		beforeEach(function() {
			mockResults = {
				issues: [
					'foo',
					'bar'
				]
			};
			jsonReporter.results(mockResults);
		});

		it('creates a BFJ stream', function() {
			assert.calledOnce(bfj.streamify);
			assert.calledWithExactly(bfj.streamify, mockResults.issues);
		});

		it('handles the stream `dataError` event', function() {
			assert.called(bfj.mockStream.on);
			assert.calledWith(bfj.mockStream.on, 'dataError');
			assert.isFunction(bfj.mockStream.on.withArgs('dataError').firstCall.args[1]);
		});

		describe('`dataError` handler', function() {
			let consoleErrorStub;
			let mockDataError;
			let processExitStub;

			beforeEach(function() {
				mockDataError = new Error('data error');
				consoleErrorStub = sinon.stub(console, 'error');
				processExitStub = sinon.stub(process, 'exit');
				bfj.mockStream.on.withArgs('dataError').firstCall.args[1](mockDataError);
				console.error.restore();
				process.exit.restore();
			});

			it('outputs the error stack to the console', function() {
				assert.calledOnce(consoleErrorStub);
				assert.calledWithExactly(consoleErrorStub, mockDataError.stack);
			});

			it('exits the process with a code of `1`', function() {
				assert.calledOnce(processExitStub);
				assert.calledWithExactly(processExitStub, 1);
			});

		});

		it('handles the stream `end` event', function() {
			assert.called(bfj.mockStream.on);
			assert.calledWith(bfj.mockStream.on, 'end');
			assert.isFunction(bfj.mockStream.on.withArgs('end').firstCall.args[1]);
		});

		describe('`end` handler', function() {
			let stdoutWriteStub;

			beforeEach(function() {
				stdoutWriteStub = sinon.stub(process.stdout, 'write');
				bfj.mockStream.on.withArgs('end').firstCall.args[1]();
				process.stdout.write.restore();
			});

			it('outputs a newline to STDOUT', function() {
				assert.calledOnce(stdoutWriteStub);
				assert.calledWithExactly(stdoutWriteStub, '\n');
			});

		});

		it('pipes the stream into `process.stdout`', function() {
			assert.calledOnce(bfj.mockStream.pipe);
			assert.calledWithExactly(bfj.mockStream.pipe, process.stdout);
		});

	});

	it('has an `error` method', function() {
		assert.isFunction(jsonReporter.error);
	});

	describe('.error(message)', function() {

		it('returns the message unchanged', function() {
			assert.strictEqual(jsonReporter.error('mock message'), 'mock message');
		});

	});

	it('does not have a `begin` method', function() {
		assert.isUndefined(jsonReporter.begin);
	});

	it('does not have a `debug` method', function() {
		assert.isUndefined(jsonReporter.debug);
	});

	it('does not have an `info` method', function() {
		assert.isUndefined(jsonReporter.info);
	});

});

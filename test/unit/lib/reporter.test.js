'use strict';

const assert = require('proclaim');
const sinon = require('sinon');

describe('lib/reporter', function() {
	let buildReporter;

	beforeEach(function() {
		buildReporter = require('../../../lib/reporter');
	});

	it('is a function', function() {
		assert.isFunction(buildReporter);
	});

	describe('buildReporter(methods)', function() {
		let methods;
		let returnValue;

		beforeEach(function() {
			methods = {
				supports: 'mock supports',
				begin: sinon.stub().returns('mock begin'),
				debug: sinon.stub().returns('mock debug'),
				error: sinon.stub().returns('mock error'),
				info: sinon.stub().returns('mock info'),
				results: sinon.stub().returns('mock results')
			};
			returnValue = buildReporter(methods);
		});

		it('returns an object', function() {
			assert.isObject(returnValue);
		});

		describe('returned object', function() {

			it('has a `supports` property set to `methods.supports`', function() {
				assert.strictEqual(returnValue.supports, methods.supports);
			});

			it('has a `begin` method', function() {
				assert.isFunction(returnValue.begin);
			});

			describe('.begin(message)', function() {
				let log;

				beforeEach(async function() {
					log = sinon.stub(global.console, 'log');
					await returnValue.begin('mock message');
					global.console.log.restore();
				});

				it('calls the original `begin` method with `message`', function() {
					assert.calledOnce(methods.begin);
					assert.calledWithExactly(methods.begin, 'mock message');
				});

				it('calls `console.log` with the original method\'s return value', function() {
					assert.calledOnce(log);
					assert.calledWithExactly(log, 'mock begin');
				});

				describe('when `methods.begin` returns a promise', function() {

					beforeEach(async function() {
						methods.begin = sinon.stub().resolves('mock begin promise');
						log = sinon.stub(global.console, 'log');
						await buildReporter(methods).begin('mock message');
						global.console.log.restore();
					});

					it('calls `console.log` with the original method\'s resolved value', function() {
						assert.calledOnce(log);
						assert.calledWithExactly(log, 'mock begin promise');
					});

				});

				describe('when `methods.begin` is not defined', function() {

					beforeEach(async function() {
						delete methods.begin;
						log = sinon.stub(global.console, 'log');
						await buildReporter(methods).begin('mock message');
						global.console.log.restore();
					});

					it('does not call `console.log`', function() {
						assert.notCalled(log);
					});

				});

			});

			it('has a `results` method', function() {
				assert.isFunction(returnValue.results);
			});

			describe('.results(message)', function() {
				let log;

				beforeEach(async function() {
					log = sinon.stub(global.console, 'log');
					await returnValue.results('mock message');
					global.console.log.restore();
				});

				it('calls the original `results` method with `message`', function() {
					assert.calledOnce(methods.results);
					assert.calledWithExactly(methods.results, 'mock message');
				});

				it('calls `console.log` with the original method\'s return value', function() {
					assert.calledOnce(log);
					assert.calledWithExactly(log, 'mock results');
				});

				describe('when `methods.results` returns a promise', function() {

					beforeEach(async function() {
						methods.results = sinon.stub().resolves('mock results promise');
						log = sinon.stub(global.console, 'log');
						await buildReporter(methods).results('mock message');
						global.console.log.restore();
					});

					it('calls `console.log` with the original method\'s resolved value', function() {
						assert.calledOnce(log);
						assert.calledWithExactly(log, 'mock results promise');
					});

				});

				describe('when `methods.results` is not defined', function() {

					beforeEach(async function() {
						delete methods.results;
						log = sinon.stub(global.console, 'log');
						await buildReporter(methods).results('mock message');
						global.console.log.restore();
					});

					it('does not call `console.log`', function() {
						assert.notCalled(log);
					});

				});

			});

			it('has a `log.debug` method', function() {
				assert.isFunction(returnValue.log.debug);
			});

			describe('.log.debug(message)', function() {
				let log;

				beforeEach(async function() {
					log = sinon.stub(global.console, 'log');
					await returnValue.log.debug('mock message');
					global.console.log.restore();
				});

				it('calls the original `debug` method with `message`', function() {
					assert.calledOnce(methods.debug);
					assert.calledWithExactly(methods.debug, 'mock message');
				});

				it('calls `console.log` with the original method\'s return value', function() {
					assert.calledOnce(log);
					assert.calledWithExactly(log, 'mock debug');
				});

				describe('when `methods.debug` returns a promise', function() {

					beforeEach(async function() {
						methods.debug = sinon.stub().resolves('mock debug promise');
						log = sinon.stub(global.console, 'log');
						await buildReporter(methods).log.debug('mock message');
						global.console.log.restore();
					});

					it('calls `console.log` with the original method\'s resolved value', function() {
						assert.calledOnce(log);
						assert.calledWithExactly(log, 'mock debug promise');
					});

				});

				describe('when `methods.debug` is not defined', function() {

					beforeEach(async function() {
						delete methods.debug;
						log = sinon.stub(global.console, 'log');
						await buildReporter(methods).log.debug('mock message');
						global.console.log.restore();
					});

					it('does not call `console.log`', function() {
						assert.notCalled(log);
					});

				});

			});

			it('has a `log.error` method', function() {
				assert.isFunction(returnValue.log.error);
			});

			describe('.log.error(message)', function() {
				let error;

				beforeEach(async function() {
					error = sinon.stub(global.console, 'error');
					await returnValue.log.error('mock message');
					global.console.error.restore();
				});

				it('calls the original `error` method with `message`', function() {
					assert.calledOnce(methods.error);
					assert.calledWithExactly(methods.error, 'mock message');
				});

				it('calls `console.error` with the original method\'s return value', function() {
					assert.calledOnce(error);
					assert.calledWithExactly(error, 'mock error');
				});

				describe('when `methods.error` returns a promise', function() {

					beforeEach(async function() {
						methods.error = sinon.stub().resolves('mock error promise');
						error = sinon.stub(global.console, 'error');
						await buildReporter(methods).log.error('mock message');
						global.console.error.restore();
					});

					it('calls `console.error` with the original method\'s resolved value', function() {
						assert.calledOnce(error);
						assert.calledWithExactly(error, 'mock error promise');
					});

				});

				describe('when `methods.error` is not defined', function() {

					beforeEach(async function() {
						delete methods.error;
						error = sinon.stub(global.console, 'error');
						await buildReporter(methods).log.error('mock message');
						global.console.error.restore();
					});

					it('does not call `console.error`', function() {
						assert.notCalled(error);
					});

				});

			});

			it('has a `log.info` method', function() {
				assert.isFunction(returnValue.log.info);
			});

			describe('.log.info(message)', function() {
				let log;

				beforeEach(async function() {
					log = sinon.stub(global.console, 'log');
					await returnValue.log.info('mock message');
					global.console.log.restore();
				});

				it('calls the original `info` method with `message`', function() {
					assert.calledOnce(methods.info);
					assert.calledWithExactly(methods.info, 'mock message');
				});

				it('calls `console.log` with the original method\'s return value', function() {
					assert.calledOnce(log);
					assert.calledWithExactly(log, 'mock info');
				});

				describe('when `methods.info` returns a promise', function() {

					beforeEach(async function() {
						methods.info = sinon.stub().resolves('mock info promise');
						log = sinon.stub(global.console, 'log');
						await buildReporter(methods).log.info('mock message');
						global.console.log.restore();
					});

					it('calls `console.log` with the original method\'s resolved value', function() {
						assert.calledOnce(log);
						assert.calledWithExactly(log, 'mock info promise');
					});

				});

				describe('when `methods.info` is not defined', function() {

					beforeEach(async function() {
						delete methods.info;
						log = sinon.stub(global.console, 'log');
						await buildReporter(methods).log.info('mock message');
						global.console.log.restore();
					});

					it('does not call `console.log`', function() {
						assert.notCalled(log);
					});

				});

			});

		});

	});

});

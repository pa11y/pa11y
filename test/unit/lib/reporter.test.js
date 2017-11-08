'use strict';

const assert = require('proclaim');
const sinon = require('sinon');

describe('lib/reporter', () => {
	let buildReporter;

	beforeEach(() => {
		buildReporter = require('../../../lib/reporter');
	});

	it('is a function', () => {
		assert.isFunction(buildReporter);
	});

	describe('buildReporter(methods)', () => {
		let methods;
		let returnValue;

		beforeEach(() => {
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

		it('returns an object', () => {
			assert.isObject(returnValue);
		});

		describe('returned object', () => {

			it('has a `supports` property set to `methods.supports`', () => {
				assert.strictEqual(returnValue.supports, methods.supports);
			});

			it('has a `begin` method', () => {
				assert.isFunction(returnValue.begin);
			});

			describe('.begin(message)', () => {
				let log;

				beforeEach(async () => {
					log = sinon.stub(global.console, 'log');
					await returnValue.begin('mock message');
					global.console.log.restore();
				});

				it('calls the original `begin` method with `message`', () => {
					assert.calledOnce(methods.begin);
					assert.calledWithExactly(methods.begin, 'mock message');
				});

				it('calls `console.log` with the original method\'s return value', () => {
					assert.calledOnce(log);
					assert.calledWithExactly(log, 'mock begin');
				});

				describe('when `methods.begin` returns a promise', () => {

					beforeEach(async () => {
						methods.begin = sinon.stub().resolves('mock begin promise');
						log = sinon.stub(global.console, 'log');
						await buildReporter(methods).begin('mock message');
						global.console.log.restore();
					});

					it('calls `console.log` with the original method\'s resolved value', () => {
						assert.calledOnce(log);
						assert.calledWithExactly(log, 'mock begin promise');
					});

				});

				describe('when `methods.begin` is not defined', () => {

					beforeEach(async () => {
						delete methods.begin;
						log = sinon.stub(global.console, 'log');
						await buildReporter(methods).begin('mock message');
						global.console.log.restore();
					});

					it('does not call `console.log`', () => {
						assert.notCalled(log);
					});

				});

			});

			it('has a `results` method', () => {
				assert.isFunction(returnValue.results);
			});

			describe('.results(message)', () => {
				let log;

				beforeEach(async () => {
					log = sinon.stub(global.console, 'log');
					await returnValue.results('mock message');
					global.console.log.restore();
				});

				it('calls the original `results` method with `message`', () => {
					assert.calledOnce(methods.results);
					assert.calledWithExactly(methods.results, 'mock message');
				});

				it('calls `console.log` with the original method\'s return value', () => {
					assert.calledOnce(log);
					assert.calledWithExactly(log, 'mock results');
				});

				describe('when `methods.results` returns a promise', () => {

					beforeEach(async () => {
						methods.results = sinon.stub().resolves('mock results promise');
						log = sinon.stub(global.console, 'log');
						await buildReporter(methods).results('mock message');
						global.console.log.restore();
					});

					it('calls `console.log` with the original method\'s resolved value', () => {
						assert.calledOnce(log);
						assert.calledWithExactly(log, 'mock results promise');
					});

				});

				describe('when `methods.results` is not defined', () => {

					beforeEach(async () => {
						delete methods.results;
						log = sinon.stub(global.console, 'log');
						await buildReporter(methods).results('mock message');
						global.console.log.restore();
					});

					it('does not call `console.log`', () => {
						assert.notCalled(log);
					});

				});

			});

			it('has a `log.debug` method', () => {
				assert.isFunction(returnValue.log.debug);
			});

			describe('.log.debug(message)', () => {
				let log;

				beforeEach(async () => {
					log = sinon.stub(global.console, 'log');
					await returnValue.log.debug('mock message');
					global.console.log.restore();
				});

				it('calls the original `debug` method with `message`', () => {
					assert.calledOnce(methods.debug);
					assert.calledWithExactly(methods.debug, 'mock message');
				});

				it('calls `console.log` with the original method\'s return value', () => {
					assert.calledOnce(log);
					assert.calledWithExactly(log, 'mock debug');
				});

				describe('when `methods.debug` returns a promise', () => {

					beforeEach(async () => {
						methods.debug = sinon.stub().resolves('mock debug promise');
						log = sinon.stub(global.console, 'log');
						await buildReporter(methods).log.debug('mock message');
						global.console.log.restore();
					});

					it('calls `console.log` with the original method\'s resolved value', () => {
						assert.calledOnce(log);
						assert.calledWithExactly(log, 'mock debug promise');
					});

				});

				describe('when `methods.debug` is not defined', () => {

					beforeEach(async () => {
						delete methods.debug;
						log = sinon.stub(global.console, 'log');
						await buildReporter(methods).log.debug('mock message');
						global.console.log.restore();
					});

					it('does not call `console.log`', () => {
						assert.notCalled(log);
					});

				});

			});

			it('has a `log.error` method', () => {
				assert.isFunction(returnValue.log.error);
			});

			describe('.log.error(message)', () => {
				let error;

				beforeEach(async () => {
					error = sinon.stub(global.console, 'error');
					await returnValue.log.error('mock message');
					global.console.error.restore();
				});

				it('calls the original `error` method with `message`', () => {
					assert.calledOnce(methods.error);
					assert.calledWithExactly(methods.error, 'mock message');
				});

				it('calls `console.error` with the original method\'s return value', () => {
					assert.calledOnce(error);
					assert.calledWithExactly(error, 'mock error');
				});

				describe('when `methods.error` returns a promise', () => {

					beforeEach(async () => {
						methods.error = sinon.stub().resolves('mock error promise');
						error = sinon.stub(global.console, 'error');
						await buildReporter(methods).log.error('mock message');
						global.console.error.restore();
					});

					it('calls `console.error` with the original method\'s resolved value', () => {
						assert.calledOnce(error);
						assert.calledWithExactly(error, 'mock error promise');
					});

				});

				describe('when `methods.error` is not defined', () => {

					beforeEach(async () => {
						delete methods.error;
						error = sinon.stub(global.console, 'error');
						await buildReporter(methods).log.error('mock message');
						global.console.error.restore();
					});

					it('does not call `console.error`', () => {
						assert.notCalled(error);
					});

				});

			});

			it('has a `log.info` method', () => {
				assert.isFunction(returnValue.log.info);
			});

			describe('.log.info(message)', () => {
				let log;

				beforeEach(async () => {
					log = sinon.stub(global.console, 'log');
					await returnValue.log.info('mock message');
					global.console.log.restore();
				});

				it('calls the original `info` method with `message`', () => {
					assert.calledOnce(methods.info);
					assert.calledWithExactly(methods.info, 'mock message');
				});

				it('calls `console.log` with the original method\'s return value', () => {
					assert.calledOnce(log);
					assert.calledWithExactly(log, 'mock info');
				});

				describe('when `methods.info` returns a promise', () => {

					beforeEach(async () => {
						methods.info = sinon.stub().resolves('mock info promise');
						log = sinon.stub(global.console, 'log');
						await buildReporter(methods).log.info('mock message');
						global.console.log.restore();
					});

					it('calls `console.log` with the original method\'s resolved value', () => {
						assert.calledOnce(log);
						assert.calledWithExactly(log, 'mock info promise');
					});

				});

				describe('when `methods.info` is not defined', () => {

					beforeEach(async () => {
						delete methods.info;
						log = sinon.stub(global.console, 'log');
						await buildReporter(methods).log.info('mock message');
						global.console.log.restore();
					});

					it('does not call `console.log`', () => {
						assert.notCalled(log);
					});

				});

			});

		});

	});

});

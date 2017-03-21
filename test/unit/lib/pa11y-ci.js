/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/pa11y-ci', () => {
	let defaults;
	let log;
	let pa11y;
	let pa11yCi;
	let queue;

	beforeEach(() => {

		defaults = sinon.spy(require('lodash/defaultsDeep'));
		mockery.registerMock('lodash/defaultsDeep', defaults);

		log = require('../mock/log.mock');

		pa11y = require('../mock/pa11y.mock');
		mockery.registerMock('pa11y', pa11y);

		queue = sinon.spy(require('async/queue'));
		mockery.registerMock('async/queue', queue);

		pa11yCi = require('../../..');
	});

	it('exports a function', () => {
		assert.isFunction(pa11yCi);
	});

	it('has a `defaults` property', () => {
		assert.isObject(pa11yCi.defaults);
	});

	describe('.defaults', () => {
		let defaults;

		beforeEach(() => {
			defaults = pa11yCi.defaults;
		});

		it('has a `concurrency` property', () => {
			assert.strictEqual(defaults.concurrency, 2);
		});

		it('has a `log` property', () => {
			assert.isObject(defaults.log);
		});

		it('has a `log.error` method', () => {
			assert.isFunction(defaults.log.error);
		});

		it('has a `log.info` method', () => {
			assert.isFunction(defaults.log.info);
		});

		it('has a `wrapWidth` property', () => {
			assert.strictEqual(defaults.wrapWidth, 80);
		});

	});

	describe('pa11yCi(urls, options)', () => {
		let pa11yError;
		let pa11yResults;
		let returnedPromise;
		let userUrls;
		let userOptions;

		beforeEach(() => {
			userUrls = [
				'foo-url',
				'bar-url',
				'baz-url'
			];
			userOptions = {
				concurrency: 4,
				log
			};

			pa11yError = new Error('Pa11y Error');
			pa11yResults = [
				{
					type: 'error',
					message: 'Pa11y Result Error',
					selector: '',
					context: ''
				},
				{
					type: 'warning',
					message: 'Pa11y Result Warning',
					selector: '',
					context: ''
				}
			];

			pa11y.mockTestRunner.run.withArgs('foo-url').yieldsAsync(null, []);
			pa11y.mockTestRunner.run.withArgs('bar-url').yieldsAsync(null, pa11yResults);
			pa11y.mockTestRunner.run.withArgs('baz-url').yieldsAsync(pa11yError);

			returnedPromise = pa11yCi(userUrls, userOptions);
		});

		it('returns a promise', () => {
			assert.instanceOf(returnedPromise, Promise);
		});

		describe('.then()', () => {
			let report;

			beforeEach(done => {
				returnedPromise.then(value => {
					report = value;
					done();
				}).catch(done);
			});

			it('defaults the options using `pa11yCi.defaults`', () => {
				assert.isObject(defaults.firstCall.args[0]);
				assert.strictEqual(defaults.firstCall.args[1], userOptions);
				assert.strictEqual(defaults.firstCall.args[2], pa11yCi.defaults);
			});

			it('deletes the `log` option', () => {
				assert.isUndefined(defaults.firstCall.returnValue.log);
			});

			it('creates a Pa11y test runner with the expected options', () => {
				assert.calledOnce(pa11y);
				assert.calledWithExactly(pa11y, defaults.firstCall.returnValue);
			});

			it('creates an Async.js queue with the expected concurrency', () => {
				assert.calledOnce(queue);
				assert.isFunction(queue.firstCall.args[0]);
				assert.strictEqual(queue.firstCall.args[1], userOptions.concurrency);
			});

			it('assigns a drain callback to the Async queue', () => {
				assert.isFunction(queue.firstCall.returnValue.drain);
			});

			it('Runs the Pa11y test runner on each of the URLs', () => {
				assert.callCount(pa11y.mockTestRunner.run, 3);
				assert.calledWith(pa11y.mockTestRunner.run, 'foo-url');
				assert.calledWith(pa11y.mockTestRunner.run, 'bar-url');
				assert.calledWith(pa11y.mockTestRunner.run, 'baz-url');
			});

			it('logs that the tests have started running', () => {
				assert.calledWithMatch(log.info, /3 URLs/i);
			});

			it('logs the number of errors for each URL, or if they fail to run', () => {
				assert.calledWithMatch(log.info, /foo-url.*0 errors/i);
				assert.calledWithMatch(log.error, /bar-url.*1 errors/i);
				assert.calledWithMatch(log.error, /baz-url.*failed to run/i);
			});

			it('logs the pass/fail ratio', () => {
				assert.calledWithMatch(log.error, /1\/3 urls passed/i);
			});

			it('logs the errors for each URL that has some', () => {
				assert.neverCalledWithMatch(log.error, /errors in foo-url/i);
				assert.calledWithMatch(log.error, /errors in bar-url/i);
				assert.calledWithMatch(log.error, /pa11y error/i);
				assert.calledWithMatch(log.error, /pa11y result error/i);
				assert.neverCalledWithMatch(log.error, /pa11y result warning/i);
			});

			it('resolves with an object', () => {
				assert.isObject(report);
			});

			describe('resolved object', () => {

				it('has a `total` property set to the total number of URLs processed', () => {
					assert.strictEqual(report.total, userUrls.length);
				});

				it('has a `passes` property set to the total number of URLs that passed the test', () => {
					assert.strictEqual(report.passes, 1);
				});

				it('has a `results` property set to an object where keys are URLs and values are their results', () => {
					assert.isObject(report.results);

					assert.isArray(report.results['foo-url']);
					assert.lengthEquals(report.results['foo-url'], 0);

					assert.isArray(report.results['bar-url']);
					assert.lengthEquals(report.results['bar-url'], 1);
					assert.strictEqual(report.results['bar-url'][0], pa11yResults[0]);

					assert.isArray(report.results['baz-url']);
					assert.lengthEquals(report.results['baz-url'], 1);
					assert.strictEqual(report.results['baz-url'][0], pa11yError);
				});

			});

		});

		describe('when all URLs pass the test', () => {

			beforeEach(() => {

				log.error.reset();
				log.info.reset();

				pa11y.mockTestRunner.run.reset();
				pa11y.mockTestRunner.run.withArgs('foo-url').yieldsAsync(null, []);
				pa11y.mockTestRunner.run.withArgs('bar-url').yieldsAsync(null, []);
				pa11y.mockTestRunner.run.withArgs('baz-url').yieldsAsync(null, []);

				returnedPromise = pa11yCi(userUrls, userOptions);
			});

			describe('.then()', () => {

				beforeEach(done => {
					returnedPromise.then(() => {
						done();
					}).catch(done);
				});

				it('logs zero errors for each URL', () => {
					assert.calledWithMatch(log.info, /foo-url.*0 errors/i);
					assert.calledWithMatch(log.info, /bar-url.*0 errors/i);
					assert.calledWithMatch(log.info, /baz-url.*0 errors/i);
				});

				it('logs the pass/fail ratio', () => {
					assert.calledWithMatch(log.info, /3\/3 urls passed/i);
				});

				it('never logs any errors', () => {
					assert.notCalled(log.error);
				});

			});

		});

		describe('when URLs include additional configurations', () => {

			beforeEach(() => {

				log.error.reset();
				log.info.reset();

				userUrls = [
					{
						url: 'qux-url',
						bar: 'baz'
					}
				];

				pa11y.mockTestRunner.run.reset();
				pa11y.mockTestRunner.run.withArgs(userUrls[0]).yieldsAsync(null, []);

				returnedPromise = pa11yCi(userUrls, userOptions);
			});

			describe('.then()', () => {
				let report;

				beforeEach(done => {
					returnedPromise.then(value => {
						report = value;
						done();
					}).catch(done);
				});

				it('Runs the Pa11y test runner on each of the URLs with configurations', () => {
					assert.callCount(pa11y.mockTestRunner.run, 1);
					assert.calledWith(pa11y.mockTestRunner.run, userUrls[0]);
				});

				it('correctly logs the number of errors for the URL', () => {
					assert.calledWithMatch(log.info, /qux-url.*0 errors/i);
				});

				describe('resolved object', () => {

					it('has a `results` property set to an object where keys are URLs and values are their results', () => {
						assert.isObject(report.results);
						assert.isArray(report.results['qux-url']);
						assert.lengthEquals(report.results['qux-url'], 0);
					});

				});

			});

		});

	});

});

'use strict';

describe('lib/reporter', () => {
	let buildReporter;

	beforeEach(() => {
		jest.resetModules();
		buildReporter = require('../../../lib/reporter');
	});

	it('is a function', () => {
		expect(buildReporter).toEqual(expect.any(Function));
	});

	describe('buildReporter(methods)', () => {
		let methods;
		let returnValue;
		let consoleLogSpy;
		let consoleErrorSpy;

		beforeEach(() => {
			consoleLogSpy = jest
				.spyOn(global.console, 'log')
				.mockImplementation(() => {});
			consoleErrorSpy = jest
				.spyOn(global.console, 'error')
				.mockImplementation(() => {});
			methods = {
				supports: 'mock supports',
				begin: jest.fn(),
				debug: jest.fn(),
				error: jest.fn(),
				info: jest.fn(),
				results: jest.fn()
			};
			returnValue = buildReporter(methods);
		});

		afterEach(() => {
			console.log.mockRestore();
			console.error.mockRestore();
		});

		it('returns an object', () => {
			expect(returnValue).toMatchObject({
				begin: expect.any(Function),
				results: expect.any(Function),
				supports: methods.supports,
				log: {
					debug: expect.any(Function),
					error: expect.any(Function),
					info: expect.any(Function)
				}
			});
		});

		describe('returned object', () => {
			it('has a `supports` property set to `methods.supports`', () => {
				expect(returnValue.supports).toEqual(methods.supports);
			});

			describe.each([
				['begin', () => consoleLogSpy],
				['results', () => consoleLogSpy],
				['info', () => consoleLogSpy],
				['debug', () => consoleLogSpy],
				['error', () => consoleErrorSpy]
			])('method %s(message)', (methodName, getConsoleSpy) => {

				describe('when returning a string', () => {
					it('calls the method and logs', async () => {
						methods[methodName].mockReturnValueOnce(`mock ${methodName}`);
						const reporterMethod = returnValue[methodName] || returnValue.log[methodName];
						await reporterMethod(`testing ${methodName}`);

						expect(methods[methodName]).toHaveBeenCalledTimes(1);
						expect(methods[methodName]).toHaveBeenCalledWith(`testing ${methodName}`);

						const spy = getConsoleSpy();
						expect(spy).toHaveBeenCalledTimes(1);
						expect(spy).toHaveBeenCalledWith(`mock ${methodName}`);
					});
				});

				describe('when returning a promise', () => {
					it('calls the method and logs', async () => {
						methods[methodName].mockResolvedValueOnce(`mock ${methodName}`);
						const reporterMethod = returnValue[methodName] || returnValue.log[methodName];
						await reporterMethod(`testing ${methodName}`);

						expect(methods[methodName]).toHaveBeenCalledTimes(1);
						expect(methods[methodName]).toHaveBeenCalledWith(`testing ${methodName}`);

						const spy = getConsoleSpy();
						expect(spy).toHaveBeenCalledTimes(1);
						expect(spy).toHaveBeenCalledWith(`mock ${methodName}`);
					});
				});


				describe('when returning nothing', () => {
					it('calls the method and logs nothing', async () => {
						methods[methodName].mockReturnValueOnce();
						const reporterMethod = returnValue[methodName] || returnValue.log[methodName];
						await reporterMethod(`testing ${methodName}`);

						expect(methods[methodName]).toHaveBeenCalledTimes(1);
						expect(methods[methodName]).toHaveBeenCalledWith(`testing ${methodName}`);

						const spy = getConsoleSpy();
						expect(spy).not.toHaveBeenCalled();
					});
				});

				describe('when not defined', () => {
					it('does not call `console.log`', async () => {
						delete methods[methodName];

						const reporter = buildReporter(methods);
						const reporterMethod = reporter[methodName] || reporter.log[methodName];
						await reporterMethod(`testing ${methodName}`);

						expect(getConsoleSpy()).not.toHaveBeenCalled();
					});
				});
			});
		});
	});
});

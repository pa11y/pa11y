'use strict';


describe('lib/reporters/json', () => {
	let bfj;
	let jsonReporter;
	let stdoutWriteStub;

	beforeEach(() => {
		jest.isolateModules(() => {
			jest.doMock('bfj', () => require('../../mocks/bfj.mock'));
			bfj = require('bfj');
			jsonReporter = require('../../../../lib/reporters/json');
		});

		bfj.streamify.mockReturnValue(bfj.mockStream);
	});

	it('is an object', () => {
		expect(typeof jsonReporter).toBe('object');
	});

	it('has a `supports` property', () => {
		expect(jsonReporter.supports).toEqual(expect.any(String));
	});

	it('has a `results` method', () => {
		expect(jsonReporter.results).toEqual(expect.any(Function));
	});

	describe('.results(pa11yResults)', () => {
		let mockResults;
		let consoleErrorStub;
		let mockDataError;
		let processExitStub;

		beforeEach(() => {
			mockResults = {
				issues: [
					'foo',
					'bar'
				]
			};

			mockDataError = new Error('data error');
			consoleErrorStub = jest.spyOn(console, 'error').mockReturnValue();
			processExitStub = jest.spyOn(process, 'exit').mockReturnValue();
			stdoutWriteStub = jest.spyOn(process.stdout, 'write').mockReturnValue();

			bfj.mockStream.on.mockImplementation((event, callback) => {
				switch (event) {
					case 'dataError': return callback(mockDataError);
					case 'end': return callback();
					default:
				}
			});
			jsonReporter.results(mockResults);
		});

		afterEach(() => {
			consoleErrorStub.mockRestore();
			consoleErrorStub.mockRestore();
			stdoutWriteStub.mockRestore();
		});

		it('creates a BFJ stream', () => {
			expect(bfj.streamify).toHaveBeenCalledTimes(1);
			expect(bfj.streamify).toHaveBeenCalledWith(mockResults.issues);
		});

		it('handles the stream `dataError` event', () => {
			expect(bfj.mockStream.on).toHaveBeenCalledWith('dataError', expect.any(Function));
		});

		describe('`dataError` handler', () => {

			it('outputs the error stack to the console and exits', () => {
				expect(bfj.mockStream.on).toHaveBeenCalledWith('dataError', expect.any(Function));
				expect(consoleErrorStub).toHaveBeenCalledTimes(1);
				expect(consoleErrorStub).toHaveBeenCalledWith(mockDataError.stack);

				expect(processExitStub).toHaveBeenCalledTimes(1);
				expect(processExitStub).toHaveBeenCalledWith(1);
			});

		});

		it('handles the stream `end` event', () => {
			expect(bfj.mockStream.on).toHaveBeenCalledWith('end', expect.any(Function));
		});

		describe('`end` handler', () => {

			it('outputs a newline to STDOUT', () => {
				expect(stdoutWriteStub).toHaveBeenCalledTimes(1);
				expect(stdoutWriteStub).toHaveBeenCalledWith('\n');
			});

		});

		it('pipes the stream into `process.stdout`', () => {
			expect(bfj.mockStream.pipe).toHaveBeenCalledTimes(1);
			expect(bfj.mockStream.pipe).toHaveBeenCalledWith(process.stdout);
		});

	});

	it('has an `error` method', () => {
		expect(jsonReporter.error).toEqual(expect.any(Function));
	});

	describe('.error(message)', () => {

		it('returns the message unchanged', () => {
			expect(jsonReporter.error('mock message')).toStrictEqual('mock message');
		});

	});

	it('does not have a `begin` method', () => {
		expect(jsonReporter.begin).toBeUndefined();
	});

	it('does not have a `debug` method', () => {
		expect(jsonReporter.debug).toBeUndefined();
	});

	it('does not have an `info` method', () => {
		expect(jsonReporter.info).toBeUndefined();
	});

});

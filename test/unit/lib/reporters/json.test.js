/* eslint max-len: 'off' */
'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('proclaim');
const sinon = require('sinon');
const jsonReporter = require('../../../../lib/reporters/json');
const {testResults, testResultsOutput} = require('../../mock/json-test-data');

// eslint-disable-next-line max-statements
describe('reporters/json', () => {
	const fileNameOptions = {
		fileName: './results.json'
	};
	const noFileNameOptions = {
		foo: 'bar'
	};
	let consoleLogStub;
	let writeFileStub;

	before(() => {
		consoleLogStub = sinon.stub(console, 'log');
		writeFileStub = sinon.stub(fs, 'writeFileSync');
	});

	afterEach(() => {
		consoleLogStub.resetHistory();
		writeFileStub.resetHistory();
	});

	after(() => {
		consoleLogStub.restore();
		writeFileStub.restore();
	});

	it('exports a factory function', () => {
		assert.isFunction(jsonReporter);

		sinon.assert.match(jsonReporter(), {
			afterAll: sinon.match.func
		});
	});

	const testWriteJsonToStdout = options => {
		jsonReporter(options).afterAll(testResults);

		sinon.assert.calledOnce(consoleLogStub);
		// The serialized JSON string is logged to console,
		// so parse JSON for object deep comparison.
		const consoleOutput = JSON.parse(consoleLogStub.getCall(0).args[0]);
		assert.deepEqual(consoleOutput, testResultsOutput);
	};

	it('writes JSON to stdout if no options specified', () => {
		testWriteJsonToStdout();
	});

	it('writes JSON to stdout if options specified without fileName', () => {
		testWriteJsonToStdout(noFileNameOptions);
	});

	it('writes JSON to file if fileName option is specified', () => {
		jsonReporter(fileNameOptions).afterAll(testResults);

		sinon.assert.calledOnce(writeFileStub);
		const fileName = writeFileStub.getCall(0).args[0];
		// The serialized JSON string is written to file,
		// so parse JSON for object deep comparison.
		const fileContents = JSON.parse(writeFileStub.getCall(0).args[1]);
		assert.equal(fileName, path.resolve(process.cwd(), fileNameOptions.fileName));
		assert.deepEqual(fileContents, testResultsOutput);
	});

	const testDoesNotWriteFile = options => {
		jsonReporter(options).afterAll(testResults);

		sinon.assert.notCalled(writeFileStub);
	};

	it('does not write JSON to file if no options specified', () => {
		testDoesNotWriteFile();
	});

	it('does not write JSON to file if options specified without fileName', () => {
		testDoesNotWriteFile(noFileNameOptions);
	});

	it('does not writes JSON to stdout if fileName option is specified', () => {
		jsonReporter(fileNameOptions).afterAll(testResults);

		sinon.assert.notCalled(consoleLogStub);
	});
});

'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const path = require('path');

describe('lib/reporter', () => {
	let fs;
	let hogan;
	let reporter;

	beforeEach(() => {
		fs = require('../mock/fs');
		mockery.registerMock('fs', fs);
		hogan = require('../mock/hogan');
		mockery.registerMock('hogan.js', hogan);
		reporter = require('../../../lib/reporter');
	});

	it('is an object', () => {
		assert.isObject(reporter);
	});

	it('has a `supports` property', () => {
		assert.isString(reporter.supports);
	});

	it('has a `results` method', () => {
		assert.isFunction(reporter.results);
	});

	describe('.results(pa11yResults)', () => {
		let mockPa11yResults;
		let resolvedValue;

		beforeEach(async () => {
			mockPa11yResults = {
				documentTitle: 'mock title',
				pageUrl: 'http://mock-url/',
				issues: [
					{
						type: 'error'
					}
				]
			};
			fs.readFile.yieldsAsync(null, 'mock template content');
			hogan.mockTemplate.render.returns('mock rendered template');
			resolvedValue = await reporter.results(mockPa11yResults);
		});

		it('reads the report HTML template', () => {
			assert.calledOnce(fs.readFile);
			assert.calledWith(fs.readFile, path.resolve(`${__dirname}/../../../lib/report.html`), 'utf-8');
		});

		it('compiles the template string', () => {
			assert.calledOnce(hogan.compile);
			assert.calledWith(hogan.compile, 'mock template content');
		});

		it('renders the template with a context object that uses the Pa11y results', () => {
			assert.calledOnce(hogan.mockTemplate.render);
			assert.isObject(hogan.mockTemplate.render.firstCall.args[0]);
			const renderContext = hogan.mockTemplate.render.firstCall.args[0];
			assert.instanceOf(renderContext.date, Date);
			assert.strictEqual(renderContext.documentTitle, mockPa11yResults.documentTitle);
			assert.strictEqual(renderContext.pageUrl, mockPa11yResults.pageUrl);
			assert.strictEqual(renderContext.errorCount, 1);
			assert.strictEqual(renderContext.warningCount, 0);
			assert.strictEqual(renderContext.noticeCount, 0);
			assert.strictEqual(renderContext.issues[0], mockPa11yResults.issues[0]);
			assert.strictEqual(renderContext.issues[0].typeLabel, 'Error');
		});

		it('resolves with the rendered template', () => {
			assert.strictEqual(resolvedValue, 'mock rendered template');
		});

	});

	it('has an `error` method', () => {
		assert.isFunction(reporter.error);
	});

	describe('.error(message)', () => {

		it('returns the message unchanged', () => {
			assert.strictEqual(reporter.error('mock message'), 'mock message');
		});

	});

	it('does not have a `begin` method', () => {
		assert.isUndefined(reporter.begin);
	});

	it('does not have a `debug` method', () => {
		assert.isUndefined(reporter.debug);
	});

	it('does not have an `info` method', () => {
		assert.isUndefined(reporter.info);
	});

});

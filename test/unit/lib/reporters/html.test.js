'use strict';

const assert = require('proclaim');
const quibble = require('quibble');
const path = require('path');

describe('lib/reporters/html', function() {
	let fs;
	let mustache;
	let reporter;

	beforeEach(function() {
		fs = require('../../mocks/fs.mock');
		quibble('fs', fs);
		mustache = require('../../mocks/mustache.mock');
		quibble('mustache', mustache);
		reporter = require('../../../../lib/reporters/html');
	});

	it('is an object', function() {
		assert.isObject(reporter);
	});

	it('has a `supports` property', function() {
		assert.isString(reporter.supports);
	});

	it('has a `results` method', function() {
		assert.isFunction(reporter.results);
	});

	describe('.results(pa11yResults)', function() {
		let mockPa11yResults;
		let resolvedValue;

		beforeEach(async function() {
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
			mustache.render.returns('mock rendered template');
			resolvedValue = await reporter.results(mockPa11yResults);
		});

		it('reads the report HTML template', function() {
			assert.calledOnce(fs.readFile);
			assert.calledWith(fs.readFile, path.join(__dirname, '..', '..', '..', '..', 'lib', 'reporters', 'report.html'), 'utf-8');
		});

		it('renders the template with a context object that uses the Pa11y results', function() {
			assert.calledOnce(mustache.render);
			assert.isString(mustache.render.firstCall.args[0]);

			const renderContext = mustache.render.firstCall.args[1];
			assert.instanceOf(renderContext.date, Date);
			assert.strictEqual(renderContext.documentTitle, mockPa11yResults.documentTitle);
			assert.strictEqual(renderContext.pageUrl, mockPa11yResults.pageUrl);
			assert.strictEqual(renderContext.errorCount, 1);
			assert.strictEqual(renderContext.warningCount, 0);
			assert.strictEqual(renderContext.noticeCount, 0);
			assert.strictEqual(renderContext.issues[0], mockPa11yResults.issues[0]);
			assert.strictEqual(renderContext.issues[0].typeLabel, 'Error');
		});

		it('resolves with the rendered template', function() {
			assert.strictEqual(resolvedValue, 'mock rendered template');
		});

	});

	it('has an `error` method', function() {
		assert.isFunction(reporter.error);
	});

	describe('.error(message)', function() {

		it('returns the message unchanged', function() {
			assert.strictEqual(reporter.error('mock message'), 'mock message');
		});

	});

	it('does not have a `begin` method', function() {
		assert.isUndefined(reporter.begin);
	});

	it('does not have a `debug` method', function() {
		assert.isUndefined(reporter.debug);
	});

	it('does not have an `info` method', function() {
		assert.isUndefined(reporter.info);
	});

});

'use strict';

const path = require('path');
const fs = require('fs');
const mustache = require('mustache');
const reporter = require('../../../../lib/reporters/html');

jest.mock('fs', () => require('../../mocks/fs.mock'));
jest.mock('mustache', () => require('../../mocks/mustache.mock'));

describe('lib/reporters/html', () => {
	it('is an object', () => {
		expect(typeof reporter).toBe('object');
	});

	it('has a `supports` property', () => {
		expect(reporter.supports).toEqual(expect.any(String));
	});

	it('has a `results` method', () => {
		expect(reporter.results).toEqual(expect.any(Function));
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
			fs.readFile
				.mockImplementationOnce((_, __, handler) => handler(null, 'mock template content'));
			mustache.render.mockReturnValue('mock rendered template');

			resolvedValue = await reporter.results(mockPa11yResults);
		});

		it('reads the report HTML template', () => {
			expect(fs.readFile).toHaveBeenCalledTimes(1);
			expect(fs.readFile).toHaveBeenCalledWith(
				path.resolve(
					`${__dirname}/../../../../lib/reporters/report.html`
				),
				'utf-8',
				expect.any(Function)
			);
		});

		it('renders the template with a context object that uses the Pa11y results', () => {
			expect(mustache.render).toHaveBeenCalledTimes(1);
			expect(typeof mustache.render.mock.calls[0][0]).toBe(
				'string'
			);
			expect(typeof mustache.render.mock.calls[0][1]).toBe(
				'object'
			);
			const renderContext = mustache.render.mock.calls[0][1];
			expect(renderContext.date).toEqual(expect.any(Date));
			expect(renderContext.documentTitle).toEqual(
				mockPa11yResults.documentTitle
			);
			expect(renderContext.pageUrl).toEqual(mockPa11yResults.pageUrl);
			expect(renderContext.errorCount).toEqual(1);
			expect(renderContext.warningCount).toEqual(0);
			expect(renderContext.noticeCount).toEqual(0);
			expect(renderContext.issues[0]).toEqual(mockPa11yResults.issues[0]);
			expect(renderContext.issues[0].typeLabel).toEqual('Error');
		});

		it('resolves with the rendered template', () => {
			expect(resolvedValue).toEqual('mock rendered template');
		});
	});

	it('has an `error` method', () => {
		expect(reporter.error).toEqual(expect.any(Function));
	});

	describe('.error(message)', () => {
		it('returns the message unchanged', () => {
			expect(reporter.error('mock message')).toEqual('mock message');
		});
	});

	it('does not have a `begin` method', () => {
		expect(reporter.begin).toBeUndefined();
	});

	it('does not have a `debug` method', () => {
		expect(reporter.debug).toBeUndefined();
	});

	it('does not have an `info` method', () => {
		expect(reporter.info).toBeUndefined();
	});
});

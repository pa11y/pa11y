'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI color scheme', function() {
	[
		{arguments: ['--color-scheme', 'light'], dark: false},
		{arguments: ['--color-scheme', 'dark'], dark: true},
		{arguments: ['--config', './mock/config/color-scheme.json'], dark: true},
		{arguments: ['--config', './mock/config/color-scheme.json', '--color-scheme', 'light'], dark: false}
	].forEach(testCase => {
		it(`applies ${testCase.arguments.join(' ')}`, async function() {
			const response = await runPa11yCli(`${global.mockWebsiteAddress}/color-scheme`, {
				arguments: [...testCase.arguments, '--reporter', 'json']
			});
			assert.isArray(response.json);
			const contrastIssue = response.json.some(issue => issue.selector === '#contrast' && /contrast/i.test(issue.message));
			assert.strictEqual(contrastIssue, testCase.dark);
		});
	});

	it('rejects an unsupported scheme with a useful error', async function() {
		const response = await runPa11yCli(`${global.mockWebsiteAddress}/color-scheme`, {
			arguments: ['--color-scheme', 'auto']
		});
		assert.strictEqual(response.exitCode, 1);
		assert.include(response.output, 'colorScheme must be one of light, dark');
	});
});

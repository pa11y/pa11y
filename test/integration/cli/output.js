'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI output', () => {
	let pa11yResponse;

	describe('when Pa11y is run on a page with errors, warnings, and notices', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--reporter', 'json'
				]
			});
		});

		it('outputs the expected issues', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 3);
		});

		it('outputs notices', () => {
			const issue = pa11yResponse.json.find(issue => issue.type === 'notice');
			assert.isObject(issue);

			// Issue code
			assert.isString(issue.code);
			assert.match(issue.code, /^WCAG2AA\./);

			// Issue message, context, and selector
			assert.isString(issue.message);
			assert.strictEqual(issue.context, '<title>Page Title</title>');
			assert.strictEqual(issue.selector, 'html > head > title');

			// Issue type
			assert.strictEqual(issue.type, 'notice');
			assert.strictEqual(issue.typeCode, 3);
		});

		it('outputs warnings', () => {
			const issue = pa11yResponse.json.find(issue => issue.type === 'warning');
			assert.isObject(issue);

			// Issue code
			assert.isString(issue.code);
			assert.match(issue.code, /^WCAG2AA\./);

			// Issue message, context, and selector
			assert.isString(issue.message);
			assert.strictEqual(issue.context, '<b>World</b>');
			assert.strictEqual(issue.selector, 'html > body > p > b');

			// Issue type
			assert.strictEqual(issue.type, 'warning');
			assert.strictEqual(issue.typeCode, 2);
		});

		it('outputs errors', () => {
			const issue = pa11yResponse.json.find(issue => issue.type === 'error');
			assert.isObject(issue);

			// Issue code
			assert.isString(issue.code);
			assert.match(issue.code, /^WCAG2AA\./);

			// Issue message, context, and selector
			assert.isString(issue.message);
			assert.strictEqual(issue.context, '<html><head>\n\n\t<meta charset="utf-8">...</html>');
			assert.strictEqual(issue.selector, 'html');

			// Issue type
			assert.strictEqual(issue.type, 'error');
			assert.strictEqual(issue.typeCode, 1);
		});

	});

});

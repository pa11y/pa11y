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
			assert.lengthEquals(pa11yResponse.json, 1);
		});

		it('does not output notices', () => {
			const notices = pa11yResponse.json.filter(foundIssue => foundIssue.type === 'notice');
			assert.lengthEquals(notices, 0);
		});

		it('does not output warnings', () => {
			const warnings = pa11yResponse.json.filter(foundIssue => foundIssue.type === 'warning');
			assert.lengthEquals(warnings, 0);
		});

		it('outputs errors', () => {
			const issue = pa11yResponse.json.find(foundIssue => foundIssue.type === 'error');
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

	describe('when Pa11y is run on a page with errors, warnings, and notices and the `--include-notices`/`--include-warnings` flags are set', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--reporter', 'json'
				]
			});
		});

		it('outputs the expected issues', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 4);
		});

		it('outputs notices', () => {
			const issue = pa11yResponse.json.find(foundIssue => foundIssue.type === 'notice');
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
			const issue = pa11yResponse.json.find(foundIssue => foundIssue.type === 'warning');
			assert.isObject(issue);

			// Issue code
			assert.isString(issue.code);
			assert.match(issue.code, /^WCAG2AA\./);

			// Issue message, context, and selector
			assert.isString(issue.message);
			assert.strictEqual(issue.context, '<img src="/path/to/image.jpg" alt="">');
			assert.strictEqual(issue.selector, 'html > body > img');

			// Issue type
			assert.strictEqual(issue.type, 'warning');
			assert.strictEqual(issue.typeCode, 2);
		});

		it('outputs errors', () => {
			const issue = pa11yResponse.json.find(foundIssue => foundIssue.type === 'error');
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

	describe('when the issues on the page have varying selectors', () => {

		before(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/selectors`, {
				arguments: [
					'--reporter', 'json'
				]
			});
		});

		it('outputs issues with the expected selectors', () => {
			assert.isArray(pa11yResponse.json);
			assert.lengthEquals(pa11yResponse.json, 8);
			const selectors = pa11yResponse.json.map(issue => issue.selector);
			assert.deepEqual(selectors, [
				'html > body > img:nth-child(1)',
				'#image2',
				'#image3',
				'#div1 > div > img',
				'html > body > div:nth-child(4) > div:nth-child(3) > img',
				'#div2 > img:nth-child(1)',
				'#div2 > img:nth-child(2)',
				'#div2 > img:nth-child(3)'
			]);
		});

	});

});

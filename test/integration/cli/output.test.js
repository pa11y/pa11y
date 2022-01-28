'use strict';

const runPa11yCli = require('../helper/pa11y-cli');
const {groupResponses} = require('../helper/pa11y-responses');

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI output', () => {
	let pa11yResponse;

	describe('when Pa11y is run on a page with errors, warnings, and notices', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--reporter', 'json'
				]
			});
		});

		it('outputs the expected issues', () => {
			expect(pa11yResponse.json).toHaveLength(1);
		});

		it('does not output notices', () => {
			const notices = pa11yResponse.json.filter(foundIssue => foundIssue.type === 'notice');
			expect(notices).toHaveLength(0);
		});

		it('does not output warnings', () => {
			const warnings = pa11yResponse.json.filter(foundIssue => foundIssue.type === 'warning');
			expect(warnings).toHaveLength(0);
		});

		it('outputs errors', () => {
			const issue = pa11yResponse.json.find(foundIssue => foundIssue.type === 'error');
			expect(typeof issue).toBe('object');

			// Issue code
			expect(issue.code).toEqual(expect.any(String));
			expect(issue.code).toMatch(/^WCAG2AA\./);

			// Issue message, context, and selector
			expect(issue.message).toEqual(expect.any(String));
			expect(issue.context).toEqual('<html><head>\n\n\t<meta charset="utf-8">...</html>');
			expect(issue.selector).toEqual('html');

			// Issue type
			expect(issue.type).toEqual('error');
			expect(issue.typeCode).toEqual(1);
		});

	});

	describe('when Pa11y is run on a page with errors, warnings, and notices and the `--include-notices`/`--include-warnings` flags are set', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--reporter', 'json'
				]
			});
		});

		it('outputs the expected issues', () => {
			expect(pa11yResponse.json.length).toBeGreaterThanOrEqual(0);

			const responses = groupResponses(pa11yResponse.json);

			expect(responses.error).toHaveLength(1);
			expect(responses.warning).toHaveLength(1);
			expect(responses.notice).toHaveLength(26);
		});

		it('outputs notices', () => {
			const issue = pa11yResponse.json.find(foundIssue => foundIssue.type === 'notice');
			expect(typeof issue).toBe('object');

			// Issue code
			expect(issue.code).toEqual(expect.any(String));
			expect(issue.code).toMatch(/^WCAG2AA\./);

			// Issue message, context, and selector
			expect(issue.message).toEqual(expect.any(String));
			expect(issue.context).toEqual('<title>Page Title</title>');
			expect(issue.selector).toEqual('html > head > title');

			// Issue type
			expect(issue.type).toEqual('notice');
			expect(issue.typeCode).toEqual(3);
		});

		it('outputs warnings', () => {
			const issue = pa11yResponse.json.find(foundIssue => foundIssue.type === 'warning');
			expect(typeof issue).toBe('object');

			// Issue code
			expect(issue.code).toEqual(expect.any(String));
			expect(issue.code).toMatch(/^WCAG2AA\./);

			// Issue message, context, and selector
			expect(issue.message).toEqual(expect.any(String));
			expect(issue.context).toEqual('<img src="/path/to/image.jpg" alt="">');
			expect(issue.selector).toEqual('html > body > img');

			// Issue type
			expect(issue.type).toEqual('warning');
			expect(issue.typeCode).toEqual(2);
		});

		it('outputs errors', () => {
			const issue = pa11yResponse.json.find(foundIssue => foundIssue.type === 'error');
			expect(typeof issue).toBe('object');

			// Issue code
			expect(issue.code).toEqual(expect.any(String));
			expect(issue.code).toMatch(/^WCAG2AA\./);

			// Issue message, context, and selector
			expect(issue.message).toEqual(expect.any(String));
			expect(issue.context).toEqual('<html><head>\n\n\t<meta charset="utf-8">...</html>');
			expect(issue.selector).toEqual('html');

			// Issue type
			expect(issue.type).toEqual('error');
			expect(issue.typeCode).toEqual(1);
		});

	});

	describe('when the issues on the page have varying selectors', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/selectors`, {
				arguments: [
					'--reporter', 'json'
				]
			});
		});

		it('outputs issues with the expected selectors', () => {
			expect(pa11yResponse.json).toHaveLength(8);
			const selectors = pa11yResponse.json.map(issue => issue.selector);
			expect(selectors).toEqual([
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

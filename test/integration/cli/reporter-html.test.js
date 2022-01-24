'use strict';

const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI reporter HTML', () => {
	let pa11yResponse;

	describe('when the `--reporter` flag is set to "html"', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--reporter', 'html'
				]
			});
		});

		it('outputs issues in HTML format', () => {
			expect(pa11yResponse.stdout).toEqual(expect.stringContaining(
				`<h1>Accessibility Report For "${global.mockWebsiteAddress}/errors"</h1>`));
			expect(pa11yResponse.stdout).toMatch(/<span.*>1 errors<\/span>/);
			expect(pa11yResponse.stdout).toMatch(/<h2>Error:[^<]*<\/h2>/);
		});

	});

	describe('when the `reporter` config is set to "html"', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--config', './mock/config/reporter-html.json'
				]
			});
		});

		it('outputs issues in HTML format', () => {
			expect(pa11yResponse.stdout).toEqual(expect.stringContaining(
				`<h1>Accessibility Report For "${global.mockWebsiteAddress}/errors"</h1>`));
			expect(pa11yResponse.stdout).toMatch(/<span.*>1 errors<\/span>/);
			expect(pa11yResponse.stdout).toMatch(/<h2>Error:[^<]*<\/h2>/);
		});

	});

});

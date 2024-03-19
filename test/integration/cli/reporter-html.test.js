'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI reporter HTML', function() {
	let pa11yResponse;

	describe('when the `--reporter` flag is set to "html"', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--reporter', 'html'
				]
			});
		});

		it('outputs issues in HTML format', function() {
			assert.include(pa11yResponse.stdout,
				`<h1>Accessibility Report For "${global.mockWebsiteAddress}/errors"</h1>`);
			assert.match(pa11yResponse.stdout, /<span.*>1 errors<\/span>/);
			assert.match(pa11yResponse.stdout, /<h2>Error:[^<]*<\/h2>/);
		});

	});

	describe('when the `reporter` config is set to "html"', function() {

		before(async function() {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--config', './mock/config/reporter-html.json'
				]
			});
		});

		it('outputs issues in HTML format', function() {
			assert.include(pa11yResponse.stdout,
				`<h1>Accessibility Report For "${global.mockWebsiteAddress}/errors"</h1>`);
			assert.match(pa11yResponse.stdout, /<span.*>1 errors<\/span>/);
			assert.match(pa11yResponse.stdout, /<h2>Error:[^<]*<\/h2>/);
		});

	});

});

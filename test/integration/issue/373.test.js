'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

// Note: this test is designed to replicate issue
// 373, where Pa11y outputs a TypeError if the HTML
// lang attribute is empty.
//
// https://github.com/pa11y/pa11y/issues/373
describe('Issue #373', function() {
	let pa11yResponse;

	before(async function() {
		pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/issue/373`, {
			arguments: [
				'--reporter', 'cli'
			]
		});
	});

	describe('CLI output', function() {

		it('does not contain a TypeError exception', function() {
			assert.notMatch(pa11yResponse.output, /typeerror: cannot read property 'replace' of null/i);
		});

	});


});

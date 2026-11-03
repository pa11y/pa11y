'use strict';

const assert = require('proclaim');
const {reporters} = require('../..');

describe('the public reporters API', function() {
	it('renders HTML results using the package entry point', async function() {
		const html = await reporters.html.results({
			documentTitle: 'Report title',
			pageUrl: 'https://example.com/',
			issues: [{
				type: 'error',
				message: 'Missing label',
				code: 'label'
			}]
		});
		assert.include(html, 'Missing label');
		assert.include(html, 'https://example.com/');
	});
});

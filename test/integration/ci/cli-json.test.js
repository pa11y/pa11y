/* eslint max-len: 'off' */
'use strict';

const path = require('path');
const assert = require('proclaim');

describe('pa11y-ci (with the `--json` flag set)', () => {

	before(() => {
		return global.cliCall([
			'--json',
			'--config',
			'mixed'
		]);
	});

	it('outputs the results as JSON', () => {
		const mocksPath = path.resolve(path.join(__dirname, '../mock/config'));
		const outputData = JSON.parse(global.lastResult.output);
		assert.deepEqual(outputData, {
			total: 3,
			errors: 1,
			passes: 1,
			results: {
				'./foo/erroring.html': [
					{
						message: `net::ERR_FILE_NOT_FOUND at file://${mocksPath}/foo/erroring.html`
					}
				],
				[`${global.mockWebsiteAddress}/failing-1`]: [
					{
						code: 'WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2',
						context: '<html><head>\n\t<meta charset="utf-8">\n...</html>',
						message: 'The html element should have a lang or xml:lang attribute which describes the language of the document.',
						runner: 'htmlcs',
						runnerExtras: {},
						selector: 'html',
						type: 'error',
						typeCode: 1
					}
				],
				[`${global.mockWebsiteAddress}/passing-1`]: []
			}
		});
	});

});

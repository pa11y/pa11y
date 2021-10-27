/* eslint max-len: 'off' */
'use strict';

// Example results object for unit tests
module.exports.testResults = {
	total: 3,
	errors: 1,
	passes: 1,
	results: {
		'./foo/erroring.html': [
			new Error(`net::ERR_FILE_NOT_FOUND at file://${__dirname}/mock/config/foo/erroring.html`)
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
};

// Example results object after JSON serialization for unit tests
module.exports.testResultsOutput = {
	total: 3,
	errors: 1,
	passes: 1,
	results: {
		'./foo/erroring.html': [
			{
				message: `net::ERR_FILE_NOT_FOUND at file://${__dirname}/mock/config/foo/erroring.html`
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
};

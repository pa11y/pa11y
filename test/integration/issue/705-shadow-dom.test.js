'use strict';

const assert = require('proclaim');
const axe = require('axe-core');
const pa11y = require('../../..');

const ignore = axe.getRules().map(rule => rule.ruleId).filter(id => id !== 'label');
const expectedIssues = {
	single: {
		selector: '#single-host → #shadow-root → #single-leaf',
		context: '<div id="single-host"></div> → #shadow-root → <input id="single-leaf" type="text">'
	},
	nested: {
		selector: '#outer-host → #shadow-root → #inner-host → #shadow-root → #nested-leaf',
		context: '<div id="outer-host"></div> → #shadow-root → <div id="inner-host"></div> → #shadow-root → <input id="nested-leaf" type="text">'
	},
	singleWithoutId: {
		selector: '#single-host → #shadow-root → div > input',
		context: '<div id="single-host"></div> → #shadow-root → <input type="text">'
	},
	nestedWithoutId: {
		selector: '#outer-host → #shadow-root → #inner-host → #shadow-root → div > input',
		context: '<div id="outer-host"></div> → #shadow-root → <div id="inner-host"></div> → #shadow-root → <input type="text">'
	},
	light: {
		selector: '#light-leaf',
		context: '<input id="light-leaf" type="text">'
	}
};

const cases = [
	['keeps both shadow paths and the light DOM control', {}, ['single', 'nested', 'light']],
	['keeps a single shadow issue inside rootElement', {rootElement: '#single-area'}, ['single']],
	['keeps a nested shadow issue inside rootElement', {rootElement: '#nested-area'}, ['nested']],
	['accepts the single shadow host as rootElement', {rootElement: '#single-host'}, ['single']],
	['accepts the outer shadow host as rootElement', {rootElement: '#outer-host'}, ['nested']],
	['excludes the single shadow issue through its containing section', {hideElements: '#single-area'}, ['nested', 'light']],
	['excludes the nested shadow issue through its containing section', {hideElements: '#nested-area'}, ['single', 'light']],
	['excludes the single shadow issue through its host', {hideElements: '#single-host'}, ['nested', 'light']],
	['excludes the nested shadow issue through its outer host', {hideElements: '#outer-host'}, ['single', 'light']],
	['combines rootElement and hideElements for a single shadow root', {
		rootElement: '#single-area',
		hideElements: '#single-host'
	}, []],
	['combines rootElement and hideElements for nested shadow roots', {
		rootElement: '#nested-area',
		hideElements: '#outer-host'
	}, []],
	['keeps the single shadow path for a leaf inside an ordinary element', {rootElement: '#single-area'}, ['single'], '?wrapped'],
	['keeps the nested shadow path for a leaf inside an ordinary element', {rootElement: '#nested-area'}, ['nested'], '?wrapped'],
	['keeps the nested path when the inner host is inside an ordinary element', {rootElement: '#nested-area'}, ['nested'], '?wrapped&wrapped-host'],
	['keeps the single path for an anonymous leaf inside an ordinary element', {rootElement: '#single-area'}, ['singleWithoutId'], '?wrapped&no-id'],
	['keeps the nested path for an anonymous leaf inside an ordinary element', {rootElement: '#nested-area'}, ['nestedWithoutId'], '?wrapped&no-id&wrapped-host'],
	['keeps the light DOM rootElement behavior', {rootElement: '#light-area'}, ['light']]
];

describe('pa11y/pa11y#705: axe results in open shadow roots', function() {
	for (const [name, options, expected, query = ''] of cases) {
		it(name, async function() {
			const result = await pa11y(`${global.mockWebsiteAddress}/shadow-dom${query}`, {
				runners: ['axe'],
				ignore,
				...options
			});
			assert.lengthEquals(result.issues, expected.length);
			const actual = result.issues.map(issue => {
				assert.strictEqual(issue.code, 'label');
				assert.strictEqual(issue.runner, 'axe');
				return {
					selector: issue.selector,
					context: issue.context
				};
			}).sort((first, second) => first.selector.localeCompare(second.selector));
			const wanted = expected.map(key => expectedIssues[key])
				.sort((first, second) => first.selector.localeCompare(second.selector));
			assert.deepEqual(actual, wanted);
		});
	}
});

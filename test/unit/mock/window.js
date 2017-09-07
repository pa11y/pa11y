'use strict';

const sinon = require('sinon');

module.exports = {
	document: {
		documentElement: {
			outerHTML: '<title>Foo</title>'
		},
		querySelector: sinon.stub().returns(null),
		querySelectorAll: sinon.stub().returns([]),
		title: 'mock-title'
	},
	location: {
		href: 'mock-location-href'
	},
	/* eslint-disable camelcase */
	HTMLCS: {
		getMessages: sinon.stub().returns([]),
		process: sinon.stub().yieldsAsync()
	},
	HTMLCS_Section508: {
		sniffs: [
			{
				include: []
			}
		]
	},
	'HTMLCS_mock-standard': {
		sniffs: [
			{
				include: []
			}
		]
	},
	HTMLCS_WCAG2AAA: {
		sniffs: [
			'mock-sniff-1',
			'mock-sniff-2'
		]
	},
	Node: {
		ELEMENT_NODE: 1
	}
	/* eslint-enable camelcase */
};

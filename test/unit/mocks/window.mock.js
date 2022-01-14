'use strict';

module.exports = {
	document: {
		documentElement: {
			outerHTML: '<title>Foo</title>'
		},
		querySelector: jest.fn().mockReturnValue(null),
		querySelectorAll: jest.fn().mockReturnValue([]),
		title: 'mock-title'
	},
	location: {
		href: 'mock-location-href'
	},
	/* eslint-disable camelcase */
	HTMLCS: {
		getMessages: jest.fn().mockReturnValue([]),
		process: jest.fn().mockResolvedValueOnce()
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

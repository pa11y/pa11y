'use strict';

var sinon = require('sinon');

module.exports = {
	callPhantom: sinon.spy(),
	document: {
		documentElement: {
			outerHTML: '<title>Foo</title>'
		},
		querySelector: sinon.stub().returns(null),
		querySelectorAll: sinon.stub().returns([])
	},
	/* eslint-disable camelcase */
	HTMLCS: {
		getMessages: sinon.stub().returns([]),
		process: sinon.stub().yieldsAsync()
	},
	HTMLCS_Section508: {
		sniffs: []
	},
	HTMLCS_WCAG2AA: {
		sniffs: [
			{
				include: []
			}
		]
	},
	HTMLCS_WCAG2AAA: {
		sniffs: ['Principle1.Guideline1_3.1_3_1_AAA']
	}
	/* eslint-enable camelcase */
};

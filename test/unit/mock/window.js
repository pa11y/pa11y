'use strict';

var sinon = require('sinon');

module.exports = {
	callPhantom: sinon.spy(),
	document: {
		querySelector: sinon.stub().returns(null),
		querySelectorAll: sinon.stub().returns([])
	},
	HTMLCS: {
		getMessages: sinon.stub().returns([]),
		process: sinon.stub().yieldsAsync()
	}
};

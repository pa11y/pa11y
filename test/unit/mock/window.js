'use strict';

var sinon = require('sinon');

module.exports = {
	callPhantom: sinon.spy(),
	document: {
		querySelector: sinon.stub().returns(null)
	},
	HTMLCS: {
		getMessages: sinon.stub().returns([]),
		process: sinon.stub().yieldsAsync()
	}
};

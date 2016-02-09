'use strict';

var sinon = require('sinon');

module.exports = {
	callPhantom: sinon.spy(),
	document: {},
	HTMLCS: {
		getMessages: sinon.stub().returns([]),
		process: sinon.stub().yieldsAsync()
	}
};

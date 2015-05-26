'use strict';

var sinon = require('sinon');

module.exports = {
	document: {},
	HTMLCS: {
		getMessages: sinon.stub().returns([]),
		process: sinon.stub().yieldsAsync()
	}
};

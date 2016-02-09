'use strict';

var sinon = require('sinon');

module.exports = {
	mockBrowser: {},
	mockPage: {
		evaluate: sinon.stub().yieldsAsync(),
		includeJs: sinon.stub().yieldsAsync(null, true),
		injectJs: sinon.stub().yieldsAsync(null, true)
	}
};

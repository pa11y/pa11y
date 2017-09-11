'use strict';

const sinon = require('sinon');

const hogan = {
	compile: sinon.stub(),
	mockTemplate: {
		render: sinon.stub()
	}
};

hogan.compile.returns(hogan.mockTemplate);

module.exports = hogan;

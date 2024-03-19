'use strict';

const sinon = require('sinon');

const bfj = {
	streamify: sinon.stub(),
	mockStream: {
		on: sinon.stub(),
		pipe: sinon.stub()
	}
};

bfj.streamify.returns(bfj.mockStream);

module.exports = bfj;

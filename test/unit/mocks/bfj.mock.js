'use strict';

const bfj = {
	streamify: jest.fn(),
	mockStream: {
		on: jest.fn(),
		pipe: jest.fn()
	}
};

module.exports = bfj;

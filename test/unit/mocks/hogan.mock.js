'use strict';

const hogan = {
	compile: jest.fn(),
	mockTemplate: {
		render: jest.fn()
	}
};

hogan.compile.mockReturnValue(hogan.mockTemplate);

module.exports = hogan;

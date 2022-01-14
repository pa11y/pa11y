'use strict';

const fs = {
	readFile: jest.fn(),
	existsSync: jest.fn(),
	readFileSync: jest.fn()
};

module.exports = fs;

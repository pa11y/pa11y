'use strict';

const mockPage = {
	addScriptTag: jest.fn(),
	close: jest.fn(),
	click: jest.fn(),
	evaluate: jest.fn(),
	focus: jest.fn(),
	goto: jest.fn(),
	on: jest.fn(),
	off: jest.fn(),
	screenshot: jest.fn(),
	setExtraHTTPHeaders: jest.fn(),
	setRequestInterception: jest.fn(),
	setUserAgent: jest.fn(),
	setViewport: jest.fn(),
	type: jest.fn(),
	waitForFunction: jest.fn()
};


const mockBrowser = {
	close: jest.fn(),
	newPage: jest.fn().mockResolvedValue(mockPage)
};

const mock = {
	launch: jest.fn().mockResolvedValue(mockBrowser),
	mockBrowser,
	mockPage
};

module.exports = mock;

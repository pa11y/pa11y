'use strict';

const sinon = require('sinon');

const puppeteer = module.exports = {
	launch: sinon.stub()
};

const mockBrowser = puppeteer.mockBrowser = {
	close: sinon.stub(),
	newPage: sinon.stub()
};

const mockPage = puppeteer.mockPage = {
	click: sinon.stub().resolves(),
	evaluate: sinon.stub().resolves(),
	focus: sinon.stub().resolves(),
	goto: sinon.stub().resolves(),
	injectFile: sinon.stub().resolves(),
	on: sinon.stub(),
	screenshot: sinon.stub().resolves(),
	setExtraHTTPHeaders: sinon.stub().resolves(),
	setRequestInterceptionEnabled: sinon.stub().resolves(),
	setUserAgent: sinon.stub().resolves(),
	setViewport: sinon.stub().resolves(),
	type: sinon.stub().resolves(),
	waitForFunction: sinon.stub().resolves()
};

puppeteer.launch.resolves(mockBrowser);
mockBrowser.newPage.resolves(mockPage);

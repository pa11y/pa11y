'use strict';

const sinon = require('sinon');

const puppeteer = {
	launch: sinon.stub()
};
module.exports = puppeteer;

const mockBrowser = {
	close: sinon.stub(),
	newPage: sinon.stub()
};
puppeteer.mockBrowser = mockBrowser;

const mockPage = {
	addScriptTag: sinon.stub().resolves(),
	close: sinon.stub().resolves(),
	click: sinon.stub().resolves(),
	evaluate: sinon.stub().resolves(),
	focus: sinon.stub().resolves(),
	goto: sinon.stub().resolves(),
	on: sinon.stub(),
	off: sinon.stub(),
	screenshot: sinon.stub().resolves(),
	setExtraHTTPHeaders: sinon.stub().resolves(),
	setRequestInterception: sinon.stub().resolves(),
	setUserAgent: sinon.stub().resolves(),
	setViewport: sinon.stub().resolves(),
	type: sinon.stub().resolves(),
	waitForFunction: sinon.stub().resolves()
};
puppeteer.mockPage = mockPage;

puppeteer.launch.resolves(mockBrowser);
mockBrowser.newPage.resolves(mockPage);

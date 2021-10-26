'use strict';

const sinon = require('sinon');

const puppeteer = module.exports = {
	launch: sinon.stub()
};

const mockBrowser = puppeteer.mockBrowser = {
	close: sinon.stub(),
	newPage: sinon.stub(),
	createIncognitoBrowserContext: sinon.spy(() => {
		return {close: mockBrowser.createIncognitoBrowserContext.close};
	})
};

mockBrowser.createIncognitoBrowserContext.close = sinon.stub();

const mockPage = (puppeteer.mockPage = {
	addScriptTag: sinon.stub().resolves(),
	close: sinon.stub().resolves(),
	click: sinon.stub().resolves(),
	evaluate: sinon.stub().resolves(),
	focus: sinon.stub().resolves(),
	goto: sinon.stub().resolves(),
	on: sinon.stub(),
	removeListener: sinon.stub(),
	screenshot: sinon.stub().resolves(),
	setExtraHTTPHeaders: sinon.stub().resolves(),
	setRequestInterception: sinon.stub().resolves(),
	setUserAgent: sinon.stub().resolves(),
	setViewport: sinon.stub().resolves(),
	type: sinon.stub().resolves(),
	waitForFunction: sinon.stub().resolves()
});

puppeteer.launch.resolves(mockBrowser);
mockBrowser.newPage.resolves(mockPage);

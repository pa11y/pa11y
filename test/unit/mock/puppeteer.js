
const sinon = require('sinon');

const puppeteer = module.exports = {
	launch: sinon.stub()
};

const mockBrowser = puppeteer.mockBrowser = {
	close: sinon.stub(),
	newPage: sinon.stub()
};

const mockPage = puppeteer.mockPage = {
	evaluate: sinon.stub().resolves(),
	goto: sinon.stub().resolves(),
	injectFile: sinon.stub().resolves(),
	screenshot: sinon.stub().resolves(),
	setExtraHTTPHeaders: sinon.stub().resolves(),
	setUserAgent: sinon.stub().resolves(),
	setViewport: sinon.stub().resolves()
};

puppeteer.launch.resolves(mockBrowser);
mockBrowser.newPage.resolves(mockPage);

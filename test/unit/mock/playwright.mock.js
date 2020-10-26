'use strict';

const sinon = require('sinon');

const playwright = module.exports = {
	launch: sinon.stub()
};

const mockBrowser = playwright.mockBrowser = {
	close: sinon.stub(),
	newPage: sinon.stub()
};

const mockPage = (playwright.mockPage = {
	addScriptTag: sinon.stub().resolves(),
	close: sinon.stub().resolves(),
	click: sinon.stub().resolves(),
	evaluate: sinon.stub().resolves(),
	focus: sinon.stub().resolves(),
	goto: sinon.stub().resolves(),
	on: sinon.stub(),
	removeListener: sinon.stub(),
	route: sinon.stub().resolves(),
	screenshot: sinon.stub().resolves(),
	setDefaultTimeout: sinon.stub(),
	setExtraHTTPHeaders: sinon.stub().resolves(),
	setRequestInterception: sinon.stub().resolves(),
	type: sinon.stub().resolves(),
	waitForFunction: sinon.stub().resolves()
});

playwright.launch.resolves(mockBrowser);
mockBrowser.newPage.resolves(mockPage);

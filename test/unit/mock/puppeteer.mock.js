'use strict';

const sinon = require('sinon');

const puppeteer = module.exports = {
	launch: sinon.stub()
};

const mockBrowser = (puppeteer.mockBrowser = {
	close: sinon.stub(),
	createIncognitoBrowserContext: sinon.spy(() => {
		return {close: mockBrowser.createIncognitoBrowserContext.close};
	})
});

mockBrowser.createIncognitoBrowserContext.close = sinon.stub();

puppeteer.launch.resolves(mockBrowser);

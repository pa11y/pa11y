'use strict';

const sinon = require('sinon');

const puppeteer = module.exports = {
	launch: sinon.stub()
};

const mockBrowser = puppeteer.mockBrowser = {
	close: sinon.stub()
};

puppeteer.launch.resolves(mockBrowser);

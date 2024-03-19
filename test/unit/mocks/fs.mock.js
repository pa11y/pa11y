'use strict';

const sinon = require('sinon');

module.exports = {
	existsSync: sinon.stub(),
	readFile: sinon.stub().yieldsAsync(),
	readFileSync: sinon.stub()
};

'use strict';

const sinon = require('sinon');

module.exports = () => ({
	beforeAll: sinon.stub(),
	begin: sinon.stub(),
	results: sinon.stub(),
	afterAll: sinon.stub()
});

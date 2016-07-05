'use strict';

const sinon = require('sinon');

const pa11y = module.exports = sinon.stub();

const mockTestRunner = module.exports.mockTestRunner = {
	run: sinon.stub()
};

const mockResults = module.exports.mockResults = [];

mockTestRunner.run.yieldsAsync(null, mockResults);
pa11y.returns(mockTestRunner);

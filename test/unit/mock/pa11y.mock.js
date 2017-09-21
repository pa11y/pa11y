'use strict';

const sinon = require('sinon');

const pa11y = module.exports = sinon.stub();

const mockResults = module.exports.mockResults = {
	issues: []
};

pa11y.resolves(mockResults);

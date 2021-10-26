'use strict';

const sinon = require('sinon');
const merge = require('lodash/merge');

const mockResults = {
	issues: []
};
const pa11y = sinon.stub().callsFake(pageUrl => Promise.resolve(merge({pageUrl}, mockResults)));

module.exports = pa11y;

module.exports.mockResults = mockResults;

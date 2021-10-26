'use strict';

const sinon = require('sinon');

const resultsStub = sinon.stub();

module.exports = ({fileName = ''} = {}) => ({
	results({pageUrl}) {
		resultsStub(pageUrl, fileName);
	}
});

module.exports.$$resultsStub = resultsStub;

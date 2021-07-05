'use strict';

const sinon = require('sinon');

const fs = {
	readFile: sinon.stub().yieldsAsync()
};

module.exports = fs;

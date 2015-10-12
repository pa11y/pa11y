'use strict';

var sinon = require('sinon');

var truffler = module.exports = sinon.stub();

truffler.mockReturn = {
	run: sinon.stub().yieldsAsync()
};

truffler.returns(truffler.mockReturn);

'use strict';

var sinon = require('sinon');

var truffler = module.exports = sinon.stub();

truffler.mockTestFunction = sinon.stub();
truffler.mockExitFunction = sinon.spy();

truffler.mockTestFunction.yieldsAsync();
truffler.yieldsAsync(null, truffler.mockTestFunction, truffler.mockExitFunction);

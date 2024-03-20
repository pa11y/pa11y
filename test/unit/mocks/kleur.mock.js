'use strict';

const sinon = require('sinon');

const kleur = {
	cyan: sinon.stub().returnsArg(0),
	green: sinon.stub().returnsArg(0),
	grey: sinon.stub().returnsArg(0),
	red: sinon.stub().returnsArg(0),
	underline: sinon.stub().returnsArg(0),
	yellow: sinon.stub().returnsArg(0)
};

// Allow for chaining
for (const key1 of Object.keys(kleur)) {
	for (const key2 of Object.keys(kleur)) {
		kleur[key1][key2] = kleur[key2];
	}
}

module.exports = kleur;

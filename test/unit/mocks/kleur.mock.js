'use strict';

const kleur = {
	cyan: jest.fn(str => str),
	green: jest.fn(str => str),
	grey: jest.fn(str => str),
	red: jest.fn(str => str),
	underline: jest.fn(str => str),
	yellow: jest.fn(str => str)
};

// Allow for chaining
// for (const key1 of Object.keys(kleur)) {
// 	for (const key2 of Object.keys(kleur)) {
// 		kleur[key1][key2] = kleur[key2];
// 	}
// }

module.exports = kleur;

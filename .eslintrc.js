'use strict';

const rules = require('pa11y-lint-config/eslint/es2017');
const extending =
	typeof rules.extends === 'string' ?
		[rules.extends] :
		rules.extends ?? [];
};

module.exports = {
	...rules,
	parserOptions: {
		...(rules.parserOptions ?? {}),
		ecmaVersion: 2020
	},
	plugins: [
		...(rules.plugins ?? []),
		'mocha'
	],
	extends: [
		...(extending),
		'plugin:mocha/recommended'
	]
};

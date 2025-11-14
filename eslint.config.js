'use strict';

const {defineConfig} = require('eslint/config');

const configPa11y = require('eslint-config-pa11y');

module.exports = defineConfig([
	configPa11y,
	{
		files: ['test/**/*.js', 'test/**/*.cjs'],
		rules: {
			'max-len': 'off',
			'prefer-arrow-callback': 'off',
			'max-statements': 'off',
			'func-style': 'off'
		},
	},
]);


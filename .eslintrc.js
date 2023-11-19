'use strict';

const pa11yConfig = require('pa11y-lint-config/eslint/es2017');

pa11yConfig.env['jest/globals'] = true;
pa11yConfig.plugins = (pa11yConfig.plugins || []).concat('jest');
pa11yConfig.parserOptions = {
	ecmaVersion: 2020
};

module.exports = pa11yConfig;

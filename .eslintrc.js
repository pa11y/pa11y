'use strict';

const pa11yConfig = require('pa11y-lint-config/eslint/es2017');

module.exports = {
    ...pa11yConfig,
    env: {
        ...pa11yConfig.env,
        'jest/globals': true
    },
    plugins: [
        "jest"
    ]
}

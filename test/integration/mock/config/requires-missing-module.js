'use strict';

// A config file that resolves but cannot be executed, because what it requires is not installed.
// Pa11y used to swallow the MODULE_NOT_FOUND this throws and run with no config at all.
// eslint-disable-next-line n/no-missing-require -- the point of this fixture
module.exports = require('pa11y-config-dependency-that-is-not-installed');

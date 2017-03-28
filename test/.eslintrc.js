'use strict';

// Clone the main config
var config = module.exports = JSON.parse(JSON.stringify(require('../.eslintrc')));

// We use `this` all over the integration tests
config.rules['no-invalid-this'] = 'off';

// Disable max line length/statements
config.rules['max-len'] = 'off';
config.rules['max-statements'] = 'off';

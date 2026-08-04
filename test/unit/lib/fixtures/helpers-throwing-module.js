'use strict';

// This file exists to be `require`d by test/unit/lib/helpers.test.js.
// It throws an error that is not a `MODULE_NOT_FOUND` error, to test
// that `requireFirst` rethrows errors it cannot recover from.
throw new Error('mock module load error');

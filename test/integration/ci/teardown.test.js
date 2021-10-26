/* eslint max-len: 'off' */
'use strict';

after(() => {
	// Http server must be closed or test process never completes with
	// all passing tests. If tests fail, mocha exits with an error.
	global.server.close();
});

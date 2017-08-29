// An example of running Pa11y programmatically
'use strict';

const pa11y = require('../..');

// Test http://example.com/
pa11y('http://example.com/', {

	// Log what's happening to the console
	log: {
		debug: console.log,
		error: console.error,
		info: console.log
	}

})
.then(result => {
	console.log(result);
})
.catch(error => {
	console.error(error.message);
});

// An example of running Pa11y programmatically
'use strict';

var pa11y = require('../..');

// Create a test instance with some default options
var test = pa11y({

	// Log what's happening to the console
	log: {
		debug: console.log.bind(console),
		error: console.error.bind(console),
		info: console.log.bind(console)
	}

});

// Test http://example.com/
test.run('example.com', function(error, result) {
	if (error) {
		return console.error(error.message);
	}
	console.log(result);
});

'use strict';

var pa11y = require('../..');

// Start pa11y
pa11y({

	// Log what's happening to the console
	log: {
		debug: console.log.bind(console),
		error: console.error.bind(console),
		info: console.log.bind(console)
	}

}, function (error, test, exit) {

	// Test http://nature.com/
	test('nature.com', function (error, result) {

		// Log the result
		console.log(result);

		// Exit pa11y
		exit();

	});

});

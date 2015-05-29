'use strict';

var async = require('async');
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

	// Use the async library to run multiple tests in series
	// https://github.com/caolan/async
	async.series({

		// Test the Nature home page
		home: test.bind(null, 'http://nature.com/'),

		// Test the Nature Plants home page
		plants: test.bind(null, 'http://nature.com/nplants/')

	}, function (error, results) {

		// Log the results
		console.log(results.home);
		console.log(results.plants);

		// Exit pa11y
		exit();

	});

});

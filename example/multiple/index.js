// An example of running Pa11y on multiple URLS
// in series
'use strict';

var async = require('async');
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


// Use the async library to run multiple tests in series
// https://github.com/caolan/async
async.series({

	// Test the Nature home page
	home: test.run.bind(test, 'http://nature.com/'),

	// Test the Nature Plants home page
	plants: test.run.bind(test, 'http://nature.com/nplants/')

}, function(error, results) {
	if (error) {
		return console.error(error.message);
	}
	console.log(results.home);
	console.log(results.plants);
});

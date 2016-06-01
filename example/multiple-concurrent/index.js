// An example of running Pa11y on multiple URLS
// in parallel, with a configurable concurrency.
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

// Define some URLs to test, and a concurrency
var urls = [
	'http://www.google.com/',
	'http://www.twitter.com/',
	'http://www.github.com/'
];
var concurrency = 2; // Run two tests at a time

// Use the async library to create a queue. This accepts a
// function to handle the URLs, and a concurrency.
// https://github.com/caolan/async
var queue = async.queue(function(url, done) {

	// The queue function will be called with each URL. We
	// can then run the pa11y test function on them and call
	// `done` when we're finished to free up the queue
	test.run(url, function(error, results) {
		if (error) {
			return console.error(error.message);
		}
		console.log(results);
		done();
	});

}, concurrency);

// Add a function that is triggered when the queue
// drains (it runs out of URLs to process)
queue.drain = function() {
	console.log('All done!');
};

// Lastly, push the URLs we wish to test onto the queue
queue.push(urls);

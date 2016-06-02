// An example of injecting a script before Pa11y runs.
// This example logs in to a fictional site then waits
// until the account page has loaded before running Pa11y
'use strict';


var pa11y = require('../..');

// Create a test instance with some default options
var test = pa11y({

	// Log what's happening to the console
	log: {
		debug: console.log.bind(console),
		error: console.error.bind(console),
		info: console.log.bind(console)
	},

	// A script to be run on the inital page before Pa11y is run.
	// beforeScript accepts three parameters, the page object, the pa11y options and a callback
	beforeScript: function(page, options, next) {

		// An example function that can be used to make sure changes have been confirmed before continuing to run Pa11y
		var waitUntil = function(condition, retries, waitOver) {
			page.evaluate(condition, function(error, result) {
				if (result || retries < 1) {
					// Once the changes have taken place continue with Pa11y testing
					waitOver();
				} else {
					retries -= 1;
					setTimeout(function() {
						waitUntil(condition, retries, waitOver);
					}, 200);
				}
			});
		};

		// The script to manipulate the page must be run with page.evaluate to be run within the context of the page
		page.evaluate(function() {
			var user = document.querySelector('#username');
			var password = document.querySelector('#password');
			var submit = document.querySelector('#submit');

			user.value = 'exampleUser';
			password.value = 'password1234';

			submit.click();

		}, function() {

			// Use the waitUntil function to set the condition, number of retries and the callback
			waitUntil(function() {
				return window.location.href === 'http://example.com/myaccount';
			}, 20, next);
		});
	}

});

// Start on the http://example.com/login where the beforeScript will be injected
test.run('example.com/login', function(error, result) {
	if (error) {
		return console.error(error.message);
	}
	console.log(result);
});

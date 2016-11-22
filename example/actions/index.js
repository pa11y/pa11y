// An example of executing some actions before Pa11y runs.
// This example logs in to a fictional site then waits
// until the account page has loaded before running Pa11y.
//
// NOTE: This is proposed behaviour, and this example
// replicates the before-script example
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

	// Run some actions before the tests
	actions: [
		'set #username to exampleUser',
		'set #password to password1234',
		'click #submit',
		'wait for url to be http://example.com/myaccount'
	]

});

// Test http://example.com/
test.run('example.com', function(error, result) {
	if (error) {
		return console.error(error.message);
	}
	console.log(result);
});

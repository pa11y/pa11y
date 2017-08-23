// An example of executing some actions before Pa11y runs.
// This example logs in to a fictional site then waits
// until the account page has loaded before running Pa11y.

const pa11y = require('../..');

// Test http://example.com/
pa11y('http://example.com/', {

	// Log what's happening to the console
	log: {
		debug: console.log,
		error: console.error,
		info: console.log
	},

	// Run some actions before the tests
	actions: [
		'set field #username to exampleUser',
		'set field #password to password1234',
		'click element #submit',
		'wait for url to be http://example.com/myaccount'
	]

})
.then(result => {
	console.log(result);
})
.catch(error => {
	console.error(error.message);
});

// An example of executing some actions before Pa11y runs.
// This example logs in to a fictional site then waits
// until the account page has loaded before running Pa11y
'use strict';

const pa11y = require('../..');

runExample();

// Async function required for us to use await
async function runExample() {
	try {

		// Test http://example.com/
		const result = await pa11y('http://example.com/', {

			// Run some actions before the tests
			actions: [
				'set field #username to exampleUser',
				'set field #password to password1234',
				'click element #submit',
				'wait for url to be http://example.com/myaccount'
			],

			// Log what's happening to the console
			log: {
				debug: console.log,
				error: console.error,
				info: console.log
			}

		});

		// Output the raw result object
		console.log(result);

	} catch (error) {

		// Output an error if it occurred
		console.error(error.message);

	}
}

// An example of running Pa11y programmatically
'use strict';

const pa11y = require('../..');

runExample();

// Async function required for us to use await
async function runExample() {
	try {

		// Test http://example.com/
		const result = await pa11y('http://example.com/', {

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

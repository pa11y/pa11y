// An example of running Pa11y on multiple URLS
'use strict';

const pa11y = require('../..');

runExample();

// Async function required for us to use await
async function runExample() {
	try {

		// Put together some options to use in each test
		const options = {
			log: {
				debug: console.log,
				error: console.error,
				info: console.log
			}
		};

		// Run tests against multiple URLs
		const results = await Promise.all([
			pa11y('http://example.com/', options),
			pa11y('http://example.com/otherpage/', options)
		]);

		// Output the raw result objects
		console.log(results[0]); // Results for the first URL
		console.log(results[1]); // Results for the second URL

	} catch (error) {

		// Output an error if it occurred
		console.error(error.message);

	}
}

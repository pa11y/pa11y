// An example of running Pa11y on multiple URLS
'use strict';

const pa11y = require('../..');

// Put together some options to use in each test
const options = {
	log: {
		debug: console.log,
		error: console.error,
		info: console.log
	}
};

// Run tests against multiple URLs
Promise.all([
	pa11y('http://example.com/', options),
	pa11y('http://example.com/otherpage/', options)
])
.then(results => {
	console.log(results[0]); // Results for the first URL
	console.log(results[1]); // Results for the second URL
})
.catch(error => {
	console.error(error.message);
});

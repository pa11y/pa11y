// An example of running Pa11y programmatically, reusing
// existing Puppeteer browsers and pages
'use strict';

const pa11y = require('../..');
const puppeteer = require('puppeteer');

runExample();

// Async function required for us to use await
async function runExample() {
	let browser;
	let pages;
	try {

		// Launch our own browser
		browser = await puppeteer.launch();

		// Create a page for the test runs
		// (Pages cannot be used in multiple runs)
		pages = [
			await browser.newPage(),
			await browser.newPage()
		];

		// Test http://example.com/ with our shared browser
		const result1 = await pa11y('http://example.com/', {
			browser,
			page: pages[0]
		});

		// Test http://example.com/otherpage/ with our shared browser
		const result2 = await pa11y('http://example.com/otherpage/', {
			browser,
			page: pages[1]
		});

		// Output the raw result objects
		console.log(result1);
		console.log(result2);

		// Close the browser instance and pages now we're done with it
		for (const page of pages) {
			await page.close();
		}
		await browser.close();

	} catch (error) {

		// Output an error if it occurred
		console.error(error.message);

		// Close the browser instance and pages if theys exist
		if (pages) {
			for (const page of pages) {
				await page.close();
			}
		}
		if (browser) {
			await browser.close();
		}

	}
}

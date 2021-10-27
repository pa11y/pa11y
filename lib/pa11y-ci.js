// This is the main library code for Pa11y CI. It's
// in charge of taking some URLs and configuration,
// then managing a queue of Pa11y jobs.
//
'use strict';

const defaults = require('lodash/defaultsDeep');
const omit = require('lodash/omit');
const queue = require('async/queue');
const puppeteer = require('puppeteer');
const pa11y = require('./pa11y');
const resolveReporters = require('./helpers/resolver');
const defaultCfg = require('./helpers/defaults');


// Here's the exports. `pa11yCi` is defined further down the
// file and is the function that actually starts to do things
module.exports = pa11yCi;


function cycleReporters(reporters, method, ...args) {
	if (!reporters.length) {
		return Promise.resolve();
	}
	return Promise.all(reporters.map(reporter => {
		if (typeof reporter[method] === 'function') {
			return reporter[method](...args);
		}
		return false;
	}));
}

// The default configuration object. This is extended with
// whatever configurations the user passes in from the
// command line
module.exports.defaults = defaultCfg;

// This function does all the setup and actually runs Pa11y
// against the passed in URLs. It accepts options in the form
// of an object and returns a Promise
function pa11yCi(urls, options) {
	// eslint-disable-next-line no-async-promise-executor
	return new Promise(async resolve => {
		// Create a test browser to assign to tests
		let testBrowser;

		// Issue #128: on specific URLs, Chrome will sometimes fail to load
		//  the page, or crash during or after loading. This attempts to
		//  relaunch the browser just once before bailing out, in case Chrome
		//  crashed at startup. This is just an attempt at mitigating it,
		//  it won't fix #128 completely or even at all
		try {
			testBrowser = await puppeteer.launch(
				options.chromeLaunchConfig
			);
		} catch (error) {
			testBrowser = await puppeteer.launch(
				options.chromeLaunchConfig
			);
		}

		// Default the passed in options
		options = defaults({}, options, module.exports.defaults);

		// Resolve reporters
		const reporters = resolveReporters(options);

		// We delete options.log because we don't want it to
		// get passed into Pa11y – we don't want super verbose
		// logs from it
		// we also remove reporters because it's not part of pa11y options
		options = omit(options, ['log', 'reporters']);

		await cycleReporters(reporters, 'beforeAll', urls);

		// Create a Pa11y test function and an async queue
		const taskQueue = queue(testRunner, options.concurrency);
		taskQueue.drain(testRunComplete);


		// Push the URLs on to the queue
		taskQueue.push(urls);

		// The report object is what we eventually return to
		// the user or command line runner
		const report = {
			total: urls.length,
			passes: 0,
			errors: 0,
			results: {}
		};

		function processResults(results, reportConfig) {
			const withinThreshold = reportConfig.threshold ?
				results.issues.length <= reportConfig.threshold :
				false;
			if (results.issues.length && !withinThreshold) {
				report.results[results.pageUrl] = results.issues;
				report.errors += results.issues.length;
			} else {
				report.results[results.pageUrl] = [];
				report.passes += 1;
			}
		}

		// This is the actual test runner, which the queue will
		// execute on each of the URLs
		async function testRunner(config) {
			let url;
			if (typeof config === 'string') {
				url = config;
				config = options;
			} else {
				url = config.url;
				config = defaults({}, config, options);
			}

			await cycleReporters(reporters, 'begin', url);

			config.browser = config.useIncognitoBrowserContext ?
				await testBrowser.createIncognitoBrowserContext() :
				testBrowser;

			// Run the Pa11y test on the current URL and add
			// results to the report object
			try {
				const results = await pa11y(url, config);
				await cycleReporters(reporters, 'results', results, config);
				processResults(results, config);
			} catch (error) {
				await cycleReporters(reporters, 'error', error, url, config);
				report.results[url] = [error];
			} finally {
				if (config.useIncognitoBrowserContext) {
					config.browser.close();
				}
			}
		}

		// This function is called once all of the URLs in the
		// queue have been tested. It outputs the actual errors
		// that occurred in the test as well as a pass/fail ratio
		function testRunComplete() {
			testBrowser.close();

			// Resolve the promise with the report
			cycleReporters(reporters, 'afterAll', report, options).then(() => resolve(report));
		}

	});
}

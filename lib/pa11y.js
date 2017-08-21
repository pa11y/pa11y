
const runAction = require('./action');
const extend = require('node.extend');
const pkg = require('../package.json');
const promiseTimeout = require('p-timeout');
const puppeteer = require('puppeteer');

module.exports = pa11y;

/**
 * Run accessibility tests on a web page.
 * @public
 * @param {String} [url] - The URL to run tests against.
 * @param {Object} [options={}] - Options to change the way tests run.
 * @returns {Promise} Returns a promise which resolves with a results object.
 */
async function pa11y(url, options = {}) {
	const state = {};
	try {

		// Switch parameters if only an options object is provided,
		// and default the options
		if (typeof url !== 'string') {
			options = url;
			url = options.url;
		}
		options = defaultOptions(options);

		// Verify that the given options are valid
		verifyOptions(options);

		// Call the actual Pa11y test runner with
		// a timeout if it takes too long
		return await promiseTimeout(
			runPa11yTest(url, options, state),
			options.timeout,
			`Pa11y timed out (${options.timeout}ms)`
		);

	} catch (error) {
		if (state.browser) {
			state.browser.close();
		}
		throw error;
	}
}

/**
 * Internal Pa11y test runner.
 * @private
 * @param {String} [url] - The URL to run tests against.
 * @param {Object} [options] - Options to change the way tests run.
 * @param {Object} [state] - An object state information will be added to.
 * @returns {Promise} Returns a promise which resolves with a results object.
 */
async function runPa11yTest(url, options, state) {

	// Launch a headless Chrome browser and create a page
	// We use a state object which is accessible from the
	// wrapping function
	const browser = state.browser = await puppeteer.launch();
	const page = await browser.newPage();

	// Set headers
	await page.setUserAgent(options.userAgent);
	if (Object.keys(options.headers).length) {
		await page.setExtraHTTPHeaders(new Map(Object.entries(options.headers)));
	}

	// Navigate to the URL we're going to test
	await page.goto(url, {
		waitUntil: 'networkidle'
	});

	// Resize the viewport
	await page.setViewport(options.viewport);

	// Run actions
	if (options.actions.length) {
		options.log.info('Running actions');
		for (const action of options.actions) {
			await runAction(browser, page, options, action);
		}
		options.log.info('Finished running actions');
	}

	// Inject HTML CodeSniffer and the Pa11y test runner
	options.log.debug('Injecting HTML CodeSniffer');
	await page.injectFile(`${__dirname}/vendor/HTMLCS.js`);
	options.log.debug('Injecting Pa11y');
	await page.injectFile(`${__dirname}/runner.js`);

	// Launch the test runner!
	options.log.debug('Running Pa11y on the page');
	/* istanbul ignore next */
	if (options.wait > 0) {
		options.log.debug(`Waiting for ${options.wait}ms`);
	}
	/* eslint-disable no-shadow */
	const results = await page.evaluate(options => {
		/* global _runPa11y */
		return _runPa11y(options);
	}, {
		hideElements: options.hideElements,
		ignore: options.ignore,
		rootElement: options.rootElement,
		rules: options.rules,
		standard: options.standard,
		wait: options.wait
	});
	/* eslint-enable no-shadow */

	options.log.debug(`Document title: "${results.documentTitle}"`);

	// Generate a screen capture
	if (options.screenCapture) {
		options.log.info(`Capturing screen, saving to "${options.screenCapture}"`);
		try {
			await page.screenshot({
				path: options.screenCapture,
				fullPage: true
			});
		} catch (error) {
			options.log.error(`Error capturing screen: ${error.message}`);
		}
	}

	// Close the browser and return the Pa11y results
	browser.close();
	return results;
}

/**
 * Default the passed in options using Pa11y's defaults.
 * @private
 * @param {Object} [options={}] - The options to apply defaults to.
 * @returns {Object} Returns the defaulted options.
 */
function defaultOptions(options) {
	options = extend({}, pa11y.defaults, options);
	options.ignore = options.ignore.map(ignored => ignored.toLowerCase());
	return options;
}

/**
 * Verify that passed in options are valid.
 * @private
 * @param {Object} [options={}] - The options to verify.
 * @returns {Undefined} Returns nothing.
 * @throws {Error} Throws if options are not valid.
 */
function verifyOptions(options) {
	if (!pa11y.allowedStandards.includes(options.standard)) {
		throw new Error(`Standard must be one of ${pa11y.allowedStandards.join(', ')}`);
	}
}

/* istanbul ignore next */
/* eslint-disable no-empty-function */
const noop = () => {};
/* eslint-enable no-empty-function */

/**
 * Default options.
 * @public
 */
pa11y.defaults = {
	actions: [],
	headers: {},
	hideElements: null,
	ignore: [],
	log: {
		begin: noop,
		debug: noop,
		error: noop,
		info: noop,
		results: noop
	},
	rootElement: null,
	rules: [],
	screenCapture: null,
	standard: 'WCAG2AA', // DONE
	timeout: 30000,
	userAgent: `pa11y/${pkg.version}`,
	viewport: {
		width: 1280,
		height: 1024
	},
	wait: 0
};

/**
 * Allowed a11y standards.
 * @public
 */
pa11y.allowedStandards = [
	'Section508',
	'WCAG2A',
	'WCAG2AA',
	'WCAG2AAA'
];

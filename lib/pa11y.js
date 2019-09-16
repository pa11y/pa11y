'use strict';

const runAction = require('./action');
const extend = require('node.extend');
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const pkg = require('../package.json');
const promiseTimeout = require('p-timeout');
const puppeteer = require('puppeteer');
const semver = require('semver');

const runnerJavascriptPromises = {};

const readFile = promisify(fs.readFile);

module.exports = pa11y;

/**
 * Run accessibility tests on a web page.
 * @public
 * @param {String} [url] - The URL to run tests against.
 * @param {Object} [options={}] - Options to change the way tests run.
 * @param {Function} [callback] - An optional callback to use instead of promises.
 * @returns {Promise} Returns a promise which resolves with a results object.
 */
async function pa11y(url, options = {}, callback) {
	const state = {};

	/* eslint-disable prefer-rest-params */
	// Check for presence of a callback function
	if (typeof arguments[arguments.length - 1] === 'function') {
		callback = arguments[arguments.length - 1];
	} else {
		callback = undefined;
	}
	/* eslint-enable prefer-rest-params */

	try {

		// Switch parameters if only an options object is provided,
		// and default the options
		if (typeof url !== 'string') {
			options = url;
			url = options.url;
		}
		url = sanitizeUrl(url);
		options = defaultOptions(options);

		// Verify that the given options are valid
		verifyOptions(options);

		// Call the actual Pa11y test runner with
		// a timeout if it takes too long
		const results = await promiseTimeout(
			runPa11yTest(url, options, state),
			options.timeout,
			`Pa11y timed out (${options.timeout}ms)`
		);

		// Run callback if present, and resolve with results
		if (callback) {
			return callback(null, results);
		}
		return results;

	} catch (error) {
		if (state.browser && state.autoClose) {
			state.browser.close();
		} else if (state.page && state.autoClosePage) {
			state.page.close();
		}

		// Run callback if present, and reject with error
		if (callback) {
			return callback(error);
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

	options.log.info(`Running Pa11y on URL ${url}`);

	// Check whether we have a browser already
	let browser;
	let page;
	if (options.browser) {
		options.log.debug('Using a pre-configured Headless Chrome instance, the `chromeLaunchConfig` option will be ignored');
		browser = state.browser = options.browser;
		state.autoClose = false;
	} else {
		// Launch a Headless Chrome browser. We use a
		// state object which is accessible from the
		// wrapping function
		options.log.debug('Launching Headless Chrome');
		browser = state.browser = await puppeteer.launch(options.chromeLaunchConfig);
		state.autoClose = true;
	}

	if (options.browser && options.page) {
		page = state.page = options.page;
		state.autoClosePage = false;
	} else {
		page = state.page = await browser.newPage();
		state.autoClosePage = true;
	}

	// Avoid to use `page.setRequestInterception` when not necessary
	// because it occasionally stops page load:
	// https://github.com/GoogleChrome/puppeteer/issues/3111
	// https://github.com/GoogleChrome/puppeteer/issues/3121
	if ((options.headers && Object.keys(options.headers).length) ||
		(options.method && options.method.toLowerCase() !== 'get') ||
		options.postData) {

		// Intercept page requests, we need to do this in order
		// to set the HTTP method or post data
		await page.setRequestInterception(true);

		// Intercept requests so we can set the HTTP method
		// and post data. We only want to make changes to the
		// first request that's handled, which is the request
		// for the page we're testing
		let interceptionHandled = false;
		page.on('request', interceptedRequest => {
			const overrides = {};
			if (!interceptionHandled) {

				// Override the request method
				options.log.debug('Setting request method');
				overrides.method = options.method;

				// Override the request headers (and include the user-agent)
				options.log.debug('Setting request headers');
				overrides.headers = {};
				for (const [key, value] of Object.entries(options.headers)) {
					overrides.headers[key.toLowerCase()] = value;
				}

				// Override the request POST data if present
				if (options.postData) {
					options.log.debug('Setting request POST data');
					overrides.postData = options.postData;
				}

				interceptionHandled = true;
			}
			interceptedRequest.continue(overrides);
		});
	}

	// Listen for console logs on the page so that we can
	// output them for debugging purposes
	page.on('console', message => {
		options.log.debug(`Browser Console: ${message.text()}`);
	});

	options.log.debug('Opening URL in Headless Chrome');

	const gotoConfig = {waitUntil: 'networkidle2'};
	gotoConfig.timeout = options.timeout;

	if (options.userAgent) {
		// Set the user agent
		await page.setUserAgent(options.userAgent);
	}

	// Resize the viewport
	await page.setViewport(options.viewport);

	// Navigate to the URL we're going to test
	if (!options.ignoreUrl) {
		await page.goto(url, gotoConfig);
	}

	// Run actions
	if (options.actions.length) {
		options.log.info('Running actions');
		for (const action of options.actions) {
			await runAction(browser, page, options, action);
		}
		options.log.info('Finished running actions');
	}

	// Load the test runners and Pa11y client-side scripts if required
	// We only load these files once on the first run of Pa11y as they don't
	// change between runs
	if (!runnerJavascriptPromises.pa11y) {
		runnerJavascriptPromises.pa11y = readFile(`${__dirname}/runner.js`, 'utf-8');
	}
	for (const runner of options.runners) {
		if (!runnerJavascriptPromises[runner]) {
			options.log.debug(`Loading runner: ${runner}`);
			runnerJavascriptPromises[runner] = loadRunnerScript(runner);
		}
	}

	// Inject the test runners
	options.log.debug('Injecting Pa11y');
	await page.evaluate(await runnerJavascriptPromises.pa11y);
	for (const runner of options.runners) {
		options.log.debug(`Injecting runner: ${runner}`);
		const script = await runnerJavascriptPromises[runner];
		await page.evaluate(script);
	}

	// Launch the test runner!
	options.log.debug('Running Pa11y on the page');
	/* istanbul ignore next */
	if (options.wait > 0) {
		options.log.debug(`Waiting for ${options.wait}ms`);
	}
	/* eslint-disable no-shadow, no-underscore-dangle */
	const results = await page.evaluate(options => {
		return window.__pa11y.run(options);
	}, {
		hideElements: options.hideElements,
		ignore: options.ignore,
		pa11yVersion: pkg.version,
		rootElement: options.rootElement,
		rules: options.rules,
		runners: options.runners,
		standard: options.standard,
		wait: options.wait
	});
	/* eslint-enable no-shadow, no-underscore-dangle */

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
	if (state.autoClose) {
		await browser.close();
	} else if (state.autoClosePage) {
		await page.close();
	}
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
	if (!options.includeNotices) {
		options.ignore.push('notice');
	}
	if (!options.includeWarnings) {
		options.ignore.push('warning');
	}
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
	if (options.page && !options.browser) {
		throw new Error('The page option must only be set alongside the browser option');
	}
	if (options.ignoreUrl && !options.page) {
		throw new Error('The ignoreUrl option must only be set alongside the page option');
	}
}

/**
 * Sanitize a URL, ensuring it has a scheme. If the URL begins with a slash or a period,
 * it will be resolved as a path against the current working directory. If the URL does
 * begin with a scheme, it will be prepended with "http://".
 * @private
 * @param {String} url - The URL to sanitize.
 * @returns {String} Returns the sanitized URL.
 */
function sanitizeUrl(url) {
	if (/^\//i.test(url)) {
		return `file://${url}`;
	}
	if (/^\./i.test(url)) {
		return `file://${path.resolve(process.cwd(), url)}`;
	}
	if (!/^(https?|file):\/\//i.test(url)) {
		return `http://${url}`;
	}
	return url;
}

/**
 * Load a Pa11y runner module.
 * @param {String} runner - The name of the runner.
 * @return {Object} Returns the required module.
 * TODO could this be refactored to use requireFirst (in bin/pa11y.js)
 */
function loadRunnerFile(runner) {
	try {
		return require(`pa11y-runner-${runner}`);
	} catch (error) {}
	return require(runner);
}

/**
 * Assert that a Pa11y runner is compatible with a version of Pa11y.
 * @param {String} runnerName - The name of the runner.
 * @param {String} runnerSupportString - The runner support string (a semver range).
 * @param {String} pa11yVersion - The version of Pa11y to test support for.
 * @throws {Error} Throws an error if the reporter does not support the given version of Pa11y
 * @returns {void}
 */
function assertReporterCompatibility(runnerName, runnerSupportString, pa11yVersion) {
	if (!runnerSupportString || !semver.satisfies(pa11yVersion, runnerSupportString)) {
		throw new Error([
			`The installed "${runnerName}" runner does not support Pa11y ${pa11yVersion}`,
			'Please update your version of Pa11y or the runner',
			`Reporter Support: ${runnerSupportString}`,
			`Pa11y Version:    ${pa11yVersion}`
		].join('\n'));
	}
}

/**
 * Loads a runner script
 * @param runner
 * @throws {Error} Throws an error if the reporter does not support the given version of Pa11y
 * @returns {Promise<String>} Promise
 */
async function loadRunnerScript(runner) {
	const runnerModule = loadRunnerFile(runner);
	let runnerBundle = '';

	assertReporterCompatibility(runner, runnerModule.supports, pkg.version);

	for (const runnerScript of runnerModule.scripts) {
		runnerBundle += '\n\n';
		runnerBundle += await readFile(runnerScript, 'utf-8');
	}

	return `
				;${runnerBundle};
				;window.__pa11y.runners['${runner}'] = ${runnerModule.run.toString()};
			`;
}

/* istanbul ignore next */
/* eslint-disable no-empty-function */
const noop = () => {};
/* eslint-enable no-empty-function */

/**
 * Default options (excluding 'level', 'reporter', and 'threshold' which are only
 * relevant when calling bin/pa11y from the CLI)
 * @public
 */
pa11y.defaults = {
	actions: [],
	browser: null,
	chromeLaunchConfig: {
		ignoreHTTPSErrors: true
	},
	headers: {},
	hideElements: null,
	ignore: [],
	ignoreUrl: false,
	includeNotices: false,
	includeWarnings: false,
	log: {
		debug: noop,
		error: noop,
		info: noop
	},
	method: 'GET',
	postData: null,
	rootElement: null,
	rules: [],
	runners: [
		'htmlcs'
	],
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

/**
 * Alias the `isValidAction` method
 */
pa11y.isValidAction = runAction.isValidAction;

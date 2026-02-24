'use strict';

const runAction = require('./action');
const option = require('./option');
const fs = require('fs');
const path = require('path');
const {version: pa11yVersion} = require('../package.json');
const puppeteer = require('puppeteer');
const {requireFirst} = require('../lib/helpers');
const semver = require('semver');

const runnersJavascript = {};

module.exports = pa11y;

/**
 * Pa11yRunner type with required properties.
 * @typedef {Object} Pa11yRunner
 * @property {Function} run Runner.run().
 * @property {String} supports This runner's semantic versioning support
 * @property {Array<String>} scripts This runner's script dependencies
 */

/**
 * Pa11y's reporting level.
 * @typedef { 'error' | 'warning' | 'notice' } Pa11yLevel
 */

/**
 * Signature for Pa11y's callback function.
 * @typedef {(error: Error, results: Pa11yResult[]) => void} Pa11yCallback
 */

/**
 * Run accessibility tests on a web page.
 * Note: actual signature is variadic and parameters shift left on sibling absence.
 * @public
 * @param {String} url The URL to run tests against.
 * @param {Object} [options={}] Options to change the way tests run.
 * @param {Pa11yCallback} [callback] An optional callback to use instead of promises.
 * @returns {Promise<Object>} A promise of Pa11y's findings.
 */
async function pa11y(url, options = {}, callback) {
	[url, options, callback] = option.parseArguments(url, options, pa11y.defaults, callback);

	const state = {};
	let pa11yError;
	let pa11yResults;

	try {
		option.verifyOptions(options, pa11y.allowedStandards);

		// Call the Pa11y test runner, applying a timeout.
		pa11yResults = await runPa11yTest(url, options, state, {
			signal: AbortSignal.timeout(options.timeout)
		});
	} catch (error) {
		if (callback) {
			pa11yError = error;
		} else {
			throw error;
		}
	} finally {
		await stateCleanup(state);
	}

	return callback ? callback(pa11yError, pa11yResults) : pa11yResults;
}

/**
 * Internal Pa11y test runner.
 * @private
 * @param {String} url - The URL to run tests against.
 * @param {Object} options - Options to change the way tests run.
 * @param {Object} state - The current pa11y internal state, fields will be mutated by
 *   this function.
 * @returns {Promise} Returns a promise which resolves with a results object.
 */
async function runPa11yTest(url, options, state) {

	options.log.info(`Running Pa11y on URL ${url}`);

	await setBrowser(options, state);

	await setPage(url, options, state);

	await interceptRequests(options, state);

	await gotoUrl(url, options, state);

	await runActionsList(options, state);

	await injectRunners(options, state);

	// Launch the test runner!
	options.log.debug('Running Pa11y on the page');

	/* istanbul ignore next */
	if (options.wait > 0) {
		options.log.debug(`Waiting for ${options.wait}ms`);
	}

	const results = await runPa11yWithOptions(options, state);

	options.log.debug(`Document title: "${results.documentTitle}"`);

	await saveScreenCapture(options, state);

	return results;
}

/**
 * Ensures that puppeteer resources are freed and listeners removed.
 * @private
 * @param {Object} state - The last-known state of the test-run.
 * @returns {Promise} A promise which resolves when resources are released
 */
async function stateCleanup(state) {
	if (state.browser && state.autoClose) {
		await state.browser.close();
	} else if (state.page) {
		state.page.off('request', state.requestInterceptCallback);
		state.page.off('console', state.consoleCallback);
		if (state.autoClosePage) {
			await state.page.close();
		}
	}
}

/**
 * Sets or initialises the browser.
 * @private
 * @param {Object} options - Options to change the way tests run.
 * @param {Object} state - The current pa11y internal state, fields will be mutated by
 *   this function.
 * @returns {Promise} A promise which resolves when resources are released
 */
async function setBrowser(options, state) {
	if (options.browser) {
		options.log.debug(
			'Using a pre-configured Headless Chrome instance, ' +
			'the `chromeLaunchConfig` option will be ignored'
		);
		state.browser = options.browser;
		state.autoClose = false;
	} else {
		// Launch a Headless Chrome browser. We use a
		// state object which is accessible from the
		// wrapping function
		options.log.debug('Launching Headless Chrome');
		state.browser = await puppeteer.launch(options.chromeLaunchConfig);
		state.autoClose = true;
	}
}

/**
 * Configures the browser page to be used for the test.
 * @private
 * @param {Object} url - The URL to test against
 * @param {Object} [options] - Options to change the way tests run.
 * @param {Object} state - The current pa11y internal state, fields will be mutated by
 *   this function.
 * @returns {Promise} A promise which resolves when the page has been configured.
 */
async function setPage(url, options, state) {
	if (options.browser && options.page) {
		state.page = options.page;
		state.autoClosePage = false;
	} else {
		state.page = await state.browser.newPage();
		state.autoClosePage = true;
	}

	// Listen for console logs on the page so that they can be output
	//  when debugging is enabled
	state.consoleCallback = message => {
		if (message && message.text()) {
			options.log.debug(`Browser Console: ${message.text()}`);
		}
	};

	state.page.on('console', state.consoleCallback);
	options.log.debug('Opening URL in Headless Chrome');
	if (options.userAgent) {
		await state.page.setUserAgent(options.userAgent);
	}
	await state.page.setViewport(options.viewport);
}

/**
 * Configures the browser page to intercept requests if necessary
 * @private
 * @param {Object} [options] - Options to change the way tests run.
 * @param {Object} state - The current pa11y internal state, fields will be mutated by
 *   this function.
 * @returns {Promise} A promise which resolves immediately if no listeners are necessary
 *   or after listener functions have been attached.
 */
async function interceptRequests(options, state) {
	// Avoid to use `page.setRequestInterception` when not necessary
	// because it occasionally stops page load:
	// https://github.com/GoogleChrome/puppeteer/issues/3111
	// https://github.com/GoogleChrome/puppeteer/issues/3121
	const shouldInterceptRequests =
		(options.headers && Object.keys(options.headers).length) ||
		(options.method && options.method.toLowerCase() !== 'get') ||
		options.postData;

	if (!shouldInterceptRequests) {
		return;
	}
	// Intercept page requests, we need to do this in order
	// to set the HTTP method or post data
	await state.page.setRequestInterception(true);

	// Intercept requests so we can set the HTTP method
	// and post data. We only want to make changes to the
	// first request that's handled, which is the request
	// for the page we're testing
	let interceptionHandled = false;
	state.requestInterceptCallback = interceptedRequest => {
		const overrides = {};
		if (!interceptionHandled) {
			// Override the request method
			options.log.debug(`Setting request method: ${options.method} `);
			overrides.method = options.method;

			// Override the request headers (and include the user-agent)
			overrides.headers = {};
			for (const [key, value] of Object.entries(options.headers)) {
				overrides.headers[key.toLowerCase()] = value;
			}
			// eslint-disable-next-line max-len
			options.log.debug(`Setting request headers:${JSON.stringify(overrides.headers, null, 4)}`);


			// Override the request POST data if present
			if (options.postData) {
				overrides.postData = options.postData;
				options.log.debug(`Setting request POST data: ${overrides.postData}`);

			}

			interceptionHandled = true;
		}
		interceptedRequest.continue(overrides);
	};
	state.page.on('request', state.requestInterceptCallback);
}

/**
 * Instructs the page to go to the provided url unless options.ignoreUrl is true
 * @private
 * @param {String} [url] - The URL of the page to be tested.
 * @param {Object} [options] - Options to change the way tests run.
 * @param {Object} state - The current pa11y internal state, fields will be mutated by
 *   this function.
 * @returns {Promise} A promise which resolves when the page URL has been set
 */
async function gotoUrl(url, options, state) {
	// Navigate to the URL we're going to test
	if (!options.ignoreUrl) {
		await state.page.goto(url, {
			waitUntil: 'networkidle2',
			timeout: options.timeout
		});
	}
}

/**
 * Carries out a synchronous list of actions in the page
 * @private
 * @param {Object} options - Options to change the way tests run.
 * @param {Object} state - The current pa11y internal state, fields will be mutated by
 *   this function.
 * @returns {Promise} A promise which resolves when all actions have completed
 */
async function runActionsList(options, state) {
	if (options.actions.length) {
		options.log.info('Running actions');
		for (const action of options.actions) {
			await runAction(state.browser, state.page, options, action);
		}
		options.log.info('Finished running actions');
	}
}

/**
 * Loads the test runners and Pa11y client-side scripts if required
 * @private
 * @param {Object} options - Options to change the way tests run.
 * @param {Object} state - The current pa11y internal state, fields will be mutated by
 *   this function.
 * @returns {Promise} A promise which resolves when all runners have been injected and evaluated
 */
async function injectRunners(options, state) {
	// We only load these files once on the first run of Pa11y as they don't
	// change between runs
	if (!runnersJavascript.pa11y) {
		runnersJavascript.pa11y = fs.readFileSync(path.join(__dirname, 'runner.js'), 'utf-8');
	}

	for (const runner of options.runners) {
		if (!runnersJavascript[runner]) {
			options.log.debug(`Loading runner: ${runner}`);
			runnersJavascript[runner] = loadRunnerScript(runner);
		}
	}

	// Inject the test runners
	options.log.debug('Injecting Pa11y');
	await state.page.evaluate(runnersJavascript.pa11y);
	for (const runner of options.runners) {
		options.log.debug(`Injecting runner: ${runner}`);
		await state.page.evaluate(runnersJavascript[runner]);
	}
}

/**
 * Sends a request to the page to instruct the injected pa11y script to run with the
 *   provided options
 * @private
 * @param {Pa11yConfiguration} options - Options to change the way tests run.
 * @param {Object} state - The current pa11y internal state, fields will be mutated by
 *   this function.
 * @returns {Promise} A promise of the results of Pa11y's evaluation
 */
const runPa11yWithOptions = ({
	hideElements,
	ignore,
	levelCapWhenNeedsReview,
	rootElement,
	rules,
	runners,
	standard,
	wait
}, state) => state.page.evaluate(
	/* eslint-disable-next-line no-underscore-dangle */
	runOptions => window.__pa11y.run(runOptions),
	{
		pa11yVersion,
		hideElements,
		ignore,
		levelCapWhenNeedsReview,
		rootElement,
		rules,
		runners,
		standard,
		wait
	}
);

/**
 * Generates a screen capture if required by the provided options
 * @private
 * @param {Object} options - Options to change the way tests run.
 * @param {Object} state - The current pa11y internal state, fields will be mutated by
 *   this function.
 * @returns {Promise} A promise which resolves when the screenshot is complete
 */
async function saveScreenCapture(options, state) {
	if (options.screenCapture) {
		options.log.info(
			`Capturing screen, saving to "${options.screenCapture}"`
		);
		try {
			await state.page.screenshot({
				path: options.screenCapture,
				fullPage: true
			});
		} catch (error) {
			options.log.error(`Error capturing screen: ${error.message}`);
		}
	}
}

/**
 * Load a Pa11y runner module.
 * @param {String} runner - The name of the runner.
 * @return {Object} Returns the required module.
 */
function loadRunnerFile(runner) {
	let runnerModule;

	try {
		// Load built-in runners by name from the runners directory.
		if (['axe', 'htmlcs'].includes(runner)) {
			runnerModule = require(path.join(__dirname, 'runners', runner));
		} else {
			runnerModule = requireFirst([
				// Standard runner module name
				`pa11y-runner-${runner}`,
				// Absolute path of runner or runner module full name
				runner,
				// Relative path of runner
				path.join(process.cwd(), runner)
			], null);
		}
	} catch (error) {
		console.error(
			`An error occurred when loading the "${runner}" runner. This is not an error`
		);
		console.error('with Pa11y itself, please check your runner configuration or contact the');
		console.error('creator of this runner\n');
		console.error(error.stack);
		throw error;
	}

	if (!runnerModule) {
		throw new Error(`Runner "${runner}" could not be found`);
	}
	return runnerModule;
}

/**
 * Assert that a Pa11y runner is compatible with a version of Pa11y.
 * @param {String} runnerName - The name of the runner.
 * @param {String} runnerSupportString - The runner support string (a semver range).
 * @param {String} pa11yVersion - The version of Pa11y to test support for.
 * @throws {Error} Throws an error if the runner does not support the given version of Pa11y
 * @returns {void}
 */
function assertRunnerCompatibility(runnerName, runnerSupportString, pa11yVersion) {
	if (!runnerSupportString || !semver.satisfies(pa11yVersion, runnerSupportString)) {
		throw new Error([
			`The installed "${runnerName}" runner does not support Pa11y ${pa11yVersion}`,
			'Please update your version of Pa11y or the runner',
			`Runner Support: ${runnerSupportString}`,
			`Pa11y Version:    ${pa11yVersion}`
		].join('\n'));
	}
}

/**
 * A stringified runner, validated and ready for insertion into the DOM,
 * with `run` available via `window.__pa11y.runners`
 * @typedef {String} StringifiedRunner
 */

/**
 * Load a runner script.
 * @param {String} name The runner's name. For example, 'axe'.
 * @returns {StringifiedRunner} Stringified runner.
 * @throws {Error} Error, indicating the runner does not support this version of Pa11y.
 */
function loadRunnerScript(name) {
	const {scripts, supports, run} = loadRunnerFile(name);

	assertRunnerCompatibility(name, supports, pa11yVersion);

	const runnerBundle = scripts.map(
		script => fs.readFileSync(script, 'utf-8')
	).join('\n\n');

	// JSON.stringify escapes all characters required to produce a valid quoted string.
	return `
		;${runnerBundle};
		;window.__pa11y.runners[${JSON.stringify(name)}] = ${run.toString()};
	`;
}

/* istanbul ignore next */
// eslint-disable-next-line no-empty-function
const noop = () => {};

/**
 * Pa11y's configuration.
 * @typedef {pa11y.defaults} Pa11yConfiguration
 */
/**
 * Default options (excluding 'level', 'reporter', and 'threshold' which are only
 * relevant when calling bin/pa11y from the CLI)
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
	levelCapWhenNeedsReview: 'error',
	method: 'GET',
	postData: null,
	rootElement: null,
	rules: [],
	runners: [
		'htmlcs'
	],
	screenCapture: null,
	standard: 'WCAG2AA',
	timeout: 60000,
	userAgent: `pa11y/${pa11yVersion}`,
	viewport: {
		width: 1280,
		height: 1024
	},
	wait: 0
};

/**
 * A set of accessibility guidelines supported by Pa11y.
 * Pa11y will treat this as an upper-bound, testing to this standard and each 'below'.
 * @typedef { 'WCAG2A' | 'WCAG2AA' | 'WCAG2AAA' } Pa11yStandard
 */
/**
 * Pa11y's supported accessibility standards
 * @type { Array<Pa11yStandard> }
 */
pa11y.allowedStandards = [
	'WCAG2A',
	'WCAG2AA',
	'WCAG2AAA'
];

/**
 * Alias the `isValidAction` method
 */
pa11y.isValidAction = runAction.isValidAction;

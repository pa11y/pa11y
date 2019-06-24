'use strict';

module.exports = runAction;
module.exports.isValidAction = isValidAction;

/**
 * Run an action string as a function.
 * @private
 * @param {Object} browser - A Puppeteer browser object.
 * @param {Object} page - A Puppeteer page object.
 * @param {Object} options - Options to pass into the action.
 * @param {String} actionString - The action string to run.
 * @returns {Promise} Returns a promise which resolves with undefined.
 */
async function runAction(browser, page, options, actionString) {

	// Find the first action that matches the given action string
	const action = module.exports.actions.find(foundAction => {
		return foundAction.match.test(actionString);
	});

	// If no action can be found, error
	if (!action) {
		throw new Error(`Failed action: "${actionString}" cannot be resolved`);
	}

	// Run the action
	options.log.debug(`Running action: ${actionString}`);
	await action.run(browser, page, options, actionString.match(action.match));
	options.log.debug('  ✔︎ action complete');
}

/**
 * Check whether an action string is valid.
 * @public
 * @param {String} actionString - The action string to validate.
 * @returns {Boolean} Returns whether the action string is valid.
 */
function isValidAction(actionString) {
	return module.exports.actions.some(foundAction => {
		return foundAction.match.test(actionString);
	});
}

/**
 * Available actions.
 * @private
 */
module.exports.actions = [

	// Action to navigate to a url
	// E.g. "navigate to http://pa11y.org"
	{
		name: 'navigate-url',
		match: /^navigate to( url)? (.+)$/i,
		run: async (browser, page, options, matches) => {
			const navigateTo = matches[2];
			try {
				await page.goto(navigateTo);
			} catch (error) {
				throw new Error(`Failed action: Could not navigate to "${navigateTo}"`);
			}
		}
	},

	// Action to click an element
	// E.g. "click .sign-in-button"
	{
		name: 'click-element',
		match: /^click( element)? (.+)$/i,
		run: async (browser, page, options, matches) => {
			const selector = matches[2];
			try {
				await page.click(selector);
			} catch (error) {
				throw new Error(`Failed action: no element matching selector "${selector}"`);
			}
		}
	},

	// Action to set an input field value
	// E.g. "set field #username to example"
	{
		name: 'set-field-value',
		match: /^set( field)? (.+?) to (.+)$/i,
		run: async (browser, page, options, matches) => {
			const selector = matches[2];
			const value = matches[3];
			try {
				/* eslint-disable no-shadow */
				await page.evaluate((selector, value) => {
					const target = document.querySelector(selector);
					if (!target) {
						return Promise.reject(new Error('No element found'));
					}
					const prototype = Object.getPrototypeOf(target);
					const {set: prototypeValueSetter} =
						Object.getOwnPropertyDescriptor(prototype, 'value') || {};
					if (prototypeValueSetter) {
						prototypeValueSetter.call(target, value);
					} else {
						target.value = value;
					}
					target.dispatchEvent(new Event('input', {
						bubbles: true
					}));
					return Promise.resolve();
				}, selector, value);
				/* eslint-enable no-shadow */
			} catch (error) {
				throw new Error(`Failed action: no element matching selector "${selector}"`);
			}
		}
	},

	// Action to check or uncheck a checkbox/radio input
	// E.g. "check field #example"
	// E.g. "uncheck field #example"
	{
		name: 'check-field',
		match: /^(check|uncheck)( field)? (.+)$/i,
		run: async (browser, page, options, matches) => {
			const checked = (matches[1] !== 'uncheck');
			const selector = matches[3];
			try {
				/* eslint-disable no-shadow */
				await page.evaluate((selector, checked) => {
					const target = document.querySelector(selector);
					if (!target) {
						return Promise.reject(new Error('No element found'));
					}
					target.checked = checked;
					target.dispatchEvent(new Event('change', {
						bubbles: true
					}));
					return Promise.resolve();
				}, selector, checked);
				/* eslint-enable no-shadow */
			} catch (error) {
				throw new Error(`Failed action: no element matching selector "${selector}"`);
			}
		}
	},

	// Action to screen capture the page to a file
	// E.g. "screen-capture example.png"
	// E.g. "capture screen to example.png"
	{
		name: 'screen-capture',
		match: /^(screen[ -]?capture|capture[ -]?screen)( to)? (.+)$/i,
		run: async (browser, page, options, matches) => {
			await page.screenshot({
				path: matches[3],
				fullPage: true
			});
		}
	},

	// Action which waits for the URL, path, or fragment to change to the given value
	// E.g. "wait for fragment to be #example"
	// E.g. "wait for path to be /example"
	// E.g. "wait for url to be https://example.com/"
	{
		name: 'wait-for-url',
		match: /^wait for (fragment|hash|host|path|url)( to (not )?be)? ([^\s]+)$/i,
		run: async (browser, page, options, matches) => {
			const expectedValue = matches[4];
			const negated = (matches[3] !== undefined);
			const subject = matches[1];

			let property;
			switch (subject) {
				case 'fragment':
				case 'hash':
					property = 'hash';
					break;
				case 'host':
					property = 'host';
					break;
				case 'path':
					property = 'pathname';
					break;
				default:
					property = 'href';
					break;
			}

			/* eslint-disable no-shadow */
			await page.waitForFunction((property, expectedValue, negated) => {
				if (negated) {
					return window.location[property] !== expectedValue;
				}
				return window.location[property] === expectedValue;
			}, {}, property, expectedValue, negated);
			/* eslint-enable no-shadow */
		}
	},

	// Action which waits for an element to be added, removed, visible, or hidden
	// E.g. "wait for element .foo to be added"
	// E.g. "wait for .foo .bar to be visible"
	{
		name: 'wait-for-element-state',
		match: /^wait for( element)? (.+)( to be) (added|removed|visible|hidden)$/i,
		run: async (browser, page, options, matches) => {
			const selector = matches[2];
			const state = matches[4];

			/* eslint-disable no-shadow */
			await page.waitForFunction((selector, state) => {
				const targetElement = document.querySelector(selector);

				// Check for added/removed states
				if (state === 'added' && targetElement) {
					return true;
				}
				if (state === 'removed' && !targetElement) {
					return true;
				}

				// Check element visibility
				let targetElementVisible = false;
				if (targetElement) {
					targetElementVisible = Boolean(
						targetElement.offsetWidth ||
						targetElement.offsetHeight ||
						targetElement.getClientRects().length
					);
				}

				// Check for visible/hidden states
				if (state === 'visible' && targetElementVisible) {
					return true;
				}
				if (state === 'hidden' && !targetElementVisible) {
					return true;
				}

				// Default to false
				return false;
			}, {
				polling: 200
			}, selector, state);
			/* eslint-enable no-shadow */
		}
	},

	// Action which waits for an element to emit an event
	// E.g. "wait for element .foo to emit example-event"
	// E.g. "wait for .tab-panel to emit load"
	{
		name: 'wait-for-element-event',
		match: /^wait for( element)? (.+) to emit (.+)$/i,
		run: async (browser, page, options, matches) => {
			const selector = matches[2];
			const eventType = matches[3];
			try {
				/* eslint-disable no-shadow, no-underscore-dangle */
				await page.evaluate((selector, eventType) => {
					const target = document.querySelector(selector);
					if (!target) {
						return Promise.reject(new Error('No element found'));
					}
					target.addEventListener(eventType, () => {
						window._pa11yWaitForElementEventFired = true;
					}, {
						once: true
					});
				}, selector, eventType);
				await page.waitForFunction(() => {
					if (window._pa11yWaitForElementEventFired) {
						delete window._pa11yWaitForElementEventFired;
						return true;
					}
					return false;
				}, {
					polling: 200
				});
				/* eslint-enable no-shadow, no-underscore-dangle */
			} catch (error) {
				throw new Error(`Failed action: no element matching selector "${selector}"`);
			}
		}
	}
];

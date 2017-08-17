
module.exports = runAction;
module.exports.isValidAction = isValidAction;

/**
 * Run an action.
 * TODO: jsdoc
 */
async function runAction(browser, page, options, actionString) {

	// Find the first action that matches the given action string
	const action = module.exports.actions.find(foundAction => {
		return foundAction.match.test(actionString);
	});

	// If no action can be found, error
	if (!action) {
		throw new Error(`§Failed action: "${actionString}" cannot be resolved`);
	}

	// Run the action
	options.log.debug(`Running action: ${actionString}`);
	await action.run(browser, page, options, actionString.match(action.match));
	options.log.debug('  ✔︎ action complete');
}

/**
 * Check whether an action string is valid.
 * TODO: jsdoc
 */
function isValidAction(actionString) {
	return module.exports.actions.some(foundAction => {
		return foundAction.match.test(actionString);
	});
}

/**
 * Available actions.
 * TODO: jsdoc
 */
module.exports.actions = [

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
		match: /^set( field)? (.+) to (.+)$/i,
		run: async (browser, page, options, matches) => {
			const selector = matches[2];
			const value = matches[3];
			try {
				await page.focus(selector);
				await page.type(value);
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
			const checked = (matches[1] === 'uncheck' ? false : true);
			const selector = matches[3];
			try {
				page.evaluate((selector, checked) => {
					const target = document.querySelector(selector);
					if (!target) {
						return Promise.reject();
					}
					target.checked = checked;
					return Promise.resolve();
				}, selector, checked);
			} catch (error) {
				throw new Error(`Failed action: no element matching selector "${selector}"`);
			}
		}
	},

	// Action which waits for the URL, path, or fragment to change to the given value
	// E.g. "wait for fragment to be #example"
	// E.g. "wait for path to be /example"
	// E.g. "wait for url to be https://example.com/"
	{
		name: 'wait-for-url',
		match: /^wait for (fragment|hash|host|path|url)( to (not )?be)? (.+)$/i,
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
				case 'url':
					property = 'href';
					break;
				default:
					// no default behaviour
					break;
			}

			await page.waitForFunction((property, expectedValue, negated) => {
				if (negated) {
					return window.location[property] !== expectedValue;
				} else {
					return window.location[property] === expectedValue;
				}
			}, {
				polling: 200
			}, property, expectedValue, negated);
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
		}
	}
];

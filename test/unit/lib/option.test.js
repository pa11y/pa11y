'use strict';

const assert = require('proclaim');
const path = require('path');
const	{parseArguments, verifyOptions} = require('../../../lib/option');

describe('lib/option', function() {
	const noop = function() { /* No-op */ };

	let defaults;

	beforeEach(function() {
		defaults = {
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
			standard: 'WCAG2AA',
			timeout: 30000,
			userAgent: `pa11y/1.2.3`,
			viewport: {
				width: 1280,
				height: 1024
			},
			wait: 0
		};

	});

	it('is a function', function() {
		assert.isFunction(parseArguments);
	});

	describe('parseArguments(url, options, defaults, callback)', function() {
		let url;
		let options;
		let callback;

		beforeEach(function() {
			callback = undefined;
			options = {
				mockOptions: true,
				timeout: 60000,
				url: 'https://mock-url/',
				log: {
					debug: noop,
					error: noop,
					info: noop
				},
				runners: [
					'axe',
					'htmlcs'
				]
			};
		});

		it('defaults the options object with `pa11y.defaults`', function() {
			const resultingOptions = {
				actions: [],
				browser: null,
				chromeLaunchConfig: {
					ignoreHTTPSErrors: true
				},
				headers: {},
				hideElements: null,
				ignore: [
					'notice',
					'warning'
				],
				ignoreUrl: false,
				includeNotices: false,
				includeWarnings: false,
				log: {
					debug: noop,
					error: noop,
					info: noop
				},
				method: 'GET',
				mockOptions: true,
				postData: null,
				rootElement: null,
				rules: [],
				runners: [
					'axe',
					'htmlcs'
				],
				screenCapture: null,
				standard: 'WCAG2AA',
				timeout: 60000,
				url: 'https://mock-url/',
				userAgent: `pa11y/1.2.3`,
				viewport: {
					width: 1280,
					height: 1024
				},
				wait: 0
			};

			[url, options, callback] = parseArguments('', options, defaults);
			assert.deepEqual(resultingOptions, options);
			assert.isUndefined(callback, undefined);
		});

		it('returns the defaults when options are empty', function() {
			const defaultsWithEmptyOptions = {
				actions: [],
				browser: null,
				chromeLaunchConfig: {
					ignoreHTTPSErrors: true
				},
				headers: {},
				hideElements: null,
				ignore: [
					'notice',
					'warning'
				],
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
				standard: 'WCAG2AA',
				timeout: 30000,
				userAgent: `pa11y/1.2.3`,
				viewport: {
					width: 1280,
					height: 1024
				},
				wait: 0
			};

			[url, options, callback] = parseArguments('', {}, defaults);
			assert.deepEqual(defaultsWithEmptyOptions, options);
		});

		describe('when defaults and options are both undefined', function() {
			beforeEach(function() {
				[url, options, callback] = parseArguments('');
			});

			it('returns an empty object', function() {
				assert.deepEqual(options, {});
			});
		});

		describe('when defaults and options are both undefined but a callback is provided', function() {
			beforeEach(function() {
				[url, options, callback] = parseArguments('', () => 'this is a callback');
			});

			it('returns an empty object', function() {
				assert.isFunction(callback);
				assert.equal(callback.call(), 'this is a callback');
				assert.deepEqual(options, {});
			});
		});

		describe('when defaults and options are both empty', function() {
			beforeEach(function() {
				[url, options, callback] = parseArguments('', {}, {});
			});

			it('returns an empty object', function() {
				assert.deepEqual(options, {});
			});
		});

		describe('when `url` does not have a scheme', function() {
			beforeEach(function() {
				[url, options, callback] = parseArguments('mock-url', {}, {});
			});

			it('navigates to `url` with an `http` scheme added', function() {
				assert.equal(url, 'http://mock-url');
			});
		});

		describe('when `url` does not have a scheme and is a valid local path', function() {
			beforeEach(function() {
				[url, options, callback] = parseArguments('README.md', {}, {});
			});

			it('navigates to `url` with a `file` scheme added', function() {
				const resolvedPath = path.resolve(process.cwd(), './README.md');
				assert.equal(url, `file://${resolvedPath}`);
			});
		});

		describe('when `url` does not have a scheme and starts with a slash', function() {
			beforeEach(function() {
				[url, options, callback] = parseArguments('/mock-path', {}, {});
			});

			it('navigates to `url` with a `file` scheme added', function() {
				assert.equal(url, 'file:///mock-path');
			});
		});

		describe('when `url` does not have a scheme and starts with a period', function() {
			beforeEach(function() {
				[url, options, callback] = parseArguments('./mock-path', {}, {});
			});

			it('navigates to `url` with a `file` scheme added and a resolved path', function() {
				const resolvedPath = path.resolve(process.cwd(), './mock-path');
				assert.equal(url, `file://${resolvedPath}`);
			});

		});

	});

	it('is a function', function() {
		assert.isFunction(verifyOptions);
	});

	describe('verifyOptions(options, allowedStandards)', function() {
		const allowedStandards = [
			'WCAG2A',
			'WCAG2AA',
			'WCAG2AAA'
		];

		describe('when `options.standard` is invalid', function() {
			const options = {};
			let rejectedError;

			beforeEach(function() {
				options.standard = 'not-a-standard';
				try {
					verifyOptions(options, allowedStandards);
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with a descriptive error', function() {
				assert.instanceOf(rejectedError, Error);
				assert.strictEqual(rejectedError.message, `Standard must be one of ${allowedStandards.join(', ')}`);
			});
		});

		describe('when puppeteer\'s `options.page` is present but `options.browser` is missing', function() {
			const options = {
				page: {},
				standard: 'WCAG2AA'
			};
			let rejectedError;

			beforeEach(function() {
				try {
					verifyOptions(options, allowedStandards);
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with a descriptive error', function() {
				assert.instanceOf(rejectedError, Error);
				assert.strictEqual(rejectedError.message, 'The page option must only be set alongside the browser option');
			});
		});

		describe('when `ignoreUrl` is present but `options.page` is missing', function() {
			const options = {
				ignoreUrl: true,
				standard: 'WCAG2AA'
			};
			let rejectedError;

			beforeEach(function() {
				try {
					verifyOptions(options, allowedStandards);
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with a descriptive error', function() {
				assert.instanceOf(rejectedError, Error);
				assert.strictEqual(rejectedError.message, 'The ignoreUrl option must only be set alongside the page option');
			});
		});
	});
});

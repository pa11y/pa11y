'use strict';

const assert = require('proclaim');
const path = require('path');

describe('lib/option', function() {
	const noop = function() { /* No-op */ };

	let defaults;
	let option;

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

		option = require('../../../lib/option');
	});

	it('is a function', function() {
		assert.isFunction(option.parseArguments);
	});

	describe('parseArguments(url, options, defaults, callback)', function() {
		// eslint-disable-next-line no-unused-vars
		let url;
		let options;
		// eslint-disable-next-line no-unused-vars
		let callback;

		beforeEach(function() {
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

			[url, options, callback] = option.parseArguments('', options, defaults);
			assert.deepEqual(resultingOptions, options);
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

			[url, options, callback] = option.parseArguments('', {}, defaults);
			assert.deepEqual(defaultsWithEmptyOptions, options);
		});

		describe('when defaults and options are both empty', function() {
			beforeEach(function() {
				[url, options, callback] = option.parseArguments('', {}, {});
			});

			it('returns an empty object', function() {
				assert.deepEqual(options, {});
			});
		});

		describe('when `url` does not have a scheme', function() {
			beforeEach(function() {
				[url, options, callback] = option.parseArguments('mock-url', {}, {});
			});

			it('navigates to `url` with an `http` scheme added', function() {
				assert.equal(url, 'http://mock-url');
			});
		});

		describe('when `url` does not have a scheme and starts with a slash', function() {
			beforeEach(function() {
				[url, options, callback] = option.parseArguments('/mock-path', {}, {});
			});

			it('navigates to `url` with a `file` scheme added', function() {
				assert.equal(url, 'file:///mock-path');
			});
		});

		describe('when `url` does not have a scheme and starts with a period', function() {
			beforeEach(function() {
				[url, options, callback] = option.parseArguments('./mock-path', {}, {});
			});

			it('navigates to `url` with an `file` scheme added and a resolved path', function() {
				const resolvedPath = path.resolve(process.cwd(), './mock-path');
				assert.equal(url, `file://${resolvedPath}`);
			});

		});

	});

	it('is a function', function() {
		assert.isFunction(option.verifyOptions);
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
					option.verifyOptions(options, allowedStandards);
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with a descriptive error', function() {
				assert.instanceOf(rejectedError, Error);
				assert.strictEqual(rejectedError.message, 'Standard must be one of WCAG2A, WCAG2AA, WCAG2AAA');
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
					option.verifyOptions(options, allowedStandards);
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
					option.verifyOptions(options, allowedStandards);
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

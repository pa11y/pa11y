'use strict';

const path = require('path');
const	{parseArguments, verifyOptions} = require('../../../lib/option');

describe('lib/option', () => {
	const noop = () => { /* No-op */ };

	let defaults;

	beforeEach(() => {
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

	it('is a function', () => {
		expect(parseArguments).toEqual(expect.any(Function));
	});

	describe('parseArguments(url, options, defaults, callback)', () => {
		let url;
		let options;
		let callback;

		beforeEach(() => {
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

		it('defaults the options object with `pa11y.defaults`', () => {
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
			expect(resultingOptions).toEqual(options);
			expect(callback).toBeUndefined();
		});

		it('returns the defaults when options are empty', () => {
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
			expect(defaultsWithEmptyOptions).toEqual(options);
		});

		describe('when defaults and options are both undefined', () => {
			beforeEach(() => {
				[url, options, callback] = parseArguments('');
			});

			it('returns an empty object', () => {
				expect(options).toEqual({});
			});
		});

		describe('when defaults and options are both undefined but a callback is provided', () => {
			beforeEach(() => {
				[url, options, callback] = parseArguments('', () => 'this is a callback');
			});

			it('returns an empty object', () => {
				expect(callback).toEqual(expect.any(Function));
				expect(callback.call()).toEqual('this is a callback');
				expect(options).toEqual({});
			});
		});

		describe('when defaults and options are both empty', () => {
			beforeEach(() => {
				[url, options, callback] = parseArguments('', {}, {});
			});

			it('returns an empty object', () => {
				expect(options).toEqual({});
			});
		});

		describe('when `url` does not have a scheme', () => {
			beforeEach(() => {
				[url, options, callback] = parseArguments('mock-url', {}, {});
			});

			it('navigates to `url` with an `http` scheme added', () => {
				expect(url).toEqual('http://mock-url');
			});
		});

		describe('when `url` does not have a scheme and is a valid local path', () => {
			beforeEach(() => {
				[url, options, callback] = parseArguments('README.md', {}, {});
			});

			it('navigates to `url` with a `file` scheme added', () => {
				const resolvedPath = path.resolve(process.cwd(), './README.md');
				expect(url).toEqual(`file://${resolvedPath}`);
			});
		});

		describe('when `url` does not have a scheme and starts with a slash', () => {
			beforeEach(() => {
				[url, options, callback] = parseArguments('/mock-path', {}, {});
			});

			it('navigates to `url` with a `file` scheme added', () => {
				expect(url).toEqual('file:///mock-path');
			});
		});

		describe('when `url` does not have a scheme and starts with a period', () => {
			beforeEach(() => {
				[url, options, callback] = parseArguments('./mock-path', {}, {});
			});

			it('navigates to `url` with a `file` scheme added and a resolved path', () => {
				const resolvedPath = path.resolve(process.cwd(), './mock-path');
				expect(url).toEqual(`file://${resolvedPath}`);
			});

		});

	});

	it('is a function', () => {
		expect(verifyOptions).toEqual(expect.any(Function));
	});

	describe('verifyOptions(options, allowedStandards)', () => {
		const allowedStandards = [
			'WCAG2A',
			'WCAG2AA',
			'WCAG2AAA'
		];

		describe('when `options.standard` is invalid', () => {
			const options = {};
			let rejectedError;

			beforeEach(() => {
				options.standard = 'not-a-standard';
				try {
					verifyOptions(options, allowedStandards);
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with a descriptive error', () => {
				expect(rejectedError).toEqual(expect.any(Error));
				expect(rejectedError.message).toEqual(`Standard must be one of ${allowedStandards.join(', ')}`);
			});
		});

		describe('when puppeteer\'s `options.page` is present but `options.browser` is missing', () => {
			const options = {
				page: {},
				standard: 'WCAG2AA'
			};
			let rejectedError;

			beforeEach(() => {
				try {
					verifyOptions(options, allowedStandards);
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with a descriptive error', () => {
				expect(rejectedError).toEqual(expect.any(Error));
				expect(rejectedError.message).toEqual('The page option must only be set alongside the browser option');
			});
		});

		describe('when `ignoreUrl` is present but `options.page` is missing', () => {
			const options = {
				ignoreUrl: true,
				standard: 'WCAG2AA'
			};
			let rejectedError;

			beforeEach(() => {
				try {
					verifyOptions(options, allowedStandards);
				} catch (error) {
					rejectedError = error;
				}
			});

			it('rejects with a descriptive error', () => {
				expect(rejectedError).toEqual(expect.any(Error));
				expect(rejectedError.message).toEqual('The ignoreUrl option must only be set alongside the page option');
			});
		});
	});
});

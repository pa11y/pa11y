'use strict';

const assert = require('proclaim');
const puppeteer = require('puppeteer');
const pa11y = require('../../../lib/pa11y');

describe('pa11y/pa11y#690: color scheme emulation', function() {
	let browser;
	let page;

	before(async function() {
		browser = await puppeteer.launch();
	});
	beforeEach(async function() {
		page = await browser.newPage();
	});
	afterEach(async function() {
		await page.close();
	});
	after(async function() {
		await browser.close();
	});

	['light', 'dark'].forEach(colorScheme => {
		it(`applies ${colorScheme} before the document's first script`, async function() {
			const results = await pa11y(`${global.mockWebsiteAddress}/color-scheme`, {browser,
				page,
				colorScheme});
			assert.strictEqual(results.documentTitle, colorScheme);
			assert.strictEqual(await page.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches), colorScheme === 'dark');
			assert.strictEqual(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), colorScheme === 'dark' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)');
		});
	});

	it('preserves a provided page\'s media features when colorScheme is omitted', async function() {
		await page.emulateMediaFeatures([
			{name: 'prefers-color-scheme',
				value: 'dark'},
			{name: 'prefers-reduced-motion',
				value: 'reduce'}
		]);
		const results = await pa11y(`${global.mockWebsiteAddress}/color-scheme`, {browser,
			page});
		assert.strictEqual(results.documentTitle, 'dark');
		assert.isTrue(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches));
	});
});

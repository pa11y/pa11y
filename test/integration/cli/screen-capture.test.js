'use strict';

const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const runPa11yCli = require('../helper/pa11y-cli');
const mkdir = promisify(fs.mkdir);
const rmdir = promisify(fs.rmdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

describe('CLI screen-capture', () => {
	let screenCaptureDirectory;
	let screenCapturePath;

	describe('when the `--screen-capture` flag is set', () => {

		beforeAll(async () => {
			screenCaptureDirectory = path.join(__dirname, '/../tmp');
			screenCapturePath = path.join(screenCaptureDirectory, '/screen-capture-flag-test.png');
			try {
				await mkdir(screenCaptureDirectory);
			} catch (error) {}
			await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--screen-capture', screenCapturePath
				]
			});
		});

		afterAll(async () => {
			await unlink(screenCapturePath);
		});

		it('saves a screen capture to the expected file', async () => {
			const stats = await stat(screenCapturePath);
			expect(stats.isFile()).toEqual(true);
		});

	});

});

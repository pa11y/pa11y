'use strict';

const assert = require('proclaim');
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

		before(async () => {
			screenCaptureDirectory = path.join(__dirname, '/../tmp');
			screenCapturePath = path.join(screenCaptureDirectory, '/test.png');
			try {
				await mkdir(screenCaptureDirectory);
			} catch (error) {}
			await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
				arguments: [
					'--screen-capture', screenCapturePath
				]
			});
		});

		after(async () => {
			await unlink(screenCapturePath);
			await rmdir(screenCaptureDirectory);
		});

		it('saves a screen capture to the expected file', async () => {
			const stats = await stat(screenCapturePath);
			assert.isTrue(stats.isFile());
		});

	});

});

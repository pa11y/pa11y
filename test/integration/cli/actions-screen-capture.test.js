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

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI action "screen-capture"', () => {
	let screenCaptureDirectory;
	let screenCapturePath;

	before(async () => {
		screenCaptureDirectory = path.join(__dirname, '/../tmp');
		screenCapturePath = path.join(screenCaptureDirectory, '/test.png');
		try {
			await mkdir(screenCaptureDirectory);
		} catch (error) {}
		await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
			arguments: [
				// Config path is relative to working directory
				'--config', '../mock/config/actions-screen-capture.json',
				'--reporter', 'json'
			],
			workingDirectory: screenCaptureDirectory
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

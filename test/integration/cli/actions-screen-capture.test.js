'use strict';

const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const runPa11yCli = require('../helper/pa11y-cli');
const mkdir = promisify(fs.mkdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

// Note: we use the JSON reporter in here to make it easier
// to inspect the output issues. The regular CLI output is
// tested in the reporter tests
describe('CLI action "screen-capture"', () => {
	let screenCaptureDirectory;
	let screenCapturePath;

	beforeAll(async () => {
		// Ensure this directory is unique to this test
		screenCaptureDirectory = path.join(__dirname, '/../tmp');
		screenCapturePath = path.join(screenCaptureDirectory, '/screen-capture-action-test.png');
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

	afterAll(async () => {
		await unlink(screenCapturePath);
	});

	it('saves a screen capture to the expected file', async () => {
		const stats = await stat(screenCapturePath);
		expect(stats.isFile()).toEqual(true);
	});

});

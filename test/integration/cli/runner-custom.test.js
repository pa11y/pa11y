'use strict';

const assert = require('proclaim');
const path = require('node:path');
const runPa11yCli = require('../helper/pa11y-cli');

const testRunner = async function(runnerPath) {
	const pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`, {
		arguments: [
			'--runner', runnerPath,
			'--reporter', 'json',
			'--include-notices',
			'--include-warnings'
		]
	});

	assert.isArray(pa11yResponse.json);
	assert.lengthEquals(pa11yResponse.json, 3);
	assert.equal(pa11yResponse.json[0].type, 'error');
	assert.equal(pa11yResponse.json[1].type, 'warning');
	assert.equal(pa11yResponse.json[2].type, 'warning');
};

describe('CLI custom runner', function() {
	describe('using relative (Linux/Windows) file path', function() {
		it('outputs the expected issues', async function() {
			// RunPa11yCli sets cwd to `__dirname/..`, which is `test/integration`,
			// so the path must be relative to that.
			const runnerPath = path.join('..', '..', 'lib', 'runners', 'axe.js');
			await testRunner(runnerPath);
		});
	});

	describe('using absolute (Linux/Windows) file path', function() {
		it('outputs the expected issues', async function() {
			const runnerPath = path.join(process.cwd(), 'lib', 'runners', 'axe.js');
			await testRunner(runnerPath);
		});
	});
});

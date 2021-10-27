'use strict';

const path = require('path');
const spawn = require('child_process').spawn;

const startMockWebsite = require('./mock/website');

before(async function() {
	// Though we set the port here and use mockWebsiteAddress, the config files
	// have to have static text so this cannot be changed.
	global.mockWebsite = await startMockWebsite(8090);
	global.mockWebsiteAddress = `http://localhost:${global.mockWebsite.address().port}`;
	global.cliCall = cliCall;
});

after(function() {
	global.mockWebsite.close();
	delete global.mockWebsite;
	delete global.mockWebsiteAddress;
});


function cliCall(cliArguments) {

	const command = path.resolve(__dirname, '../../bin/pa11y-ci.js');
	const result = {
		output: '',
		stdout: '',
		stderr: '',
		code: 0
	};

	return new Promise(resolve => {
		const child = spawn(command, cliArguments || [], {
			cwd: path.join(__dirname, 'mock/config'),
			env: process.env
		});
		child.stdout.on('data', data => {
			result.stdout += data;
			result.output += data;
		});
		child.stderr.on('data', data => {
			result.stderr += data;
			result.output += data;
		});
		child.on('close', code => {
			result.code = code;
			global.lastResult = result;
			resolve(result);
		});
	});

}

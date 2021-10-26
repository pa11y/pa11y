/* eslint max-len: 'off' */
'use strict';

const path = require('path');
const spawn = require('child_process').spawn;
const startWebsite = require('./mock/website');

before(done => {
	startWebsite(8090, (error, server) => {
		if (!error) {
			global.server = server;
			global.cliCall = cliCall;
		}
		done(error);
	});
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

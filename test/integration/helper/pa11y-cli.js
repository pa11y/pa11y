'use strict';

const extend = require('node.extend');
const {spawn} = require('child_process');
const path = require('path');

module.exports = function runPa11yCli(url, options = {}) {

	// Default the options
	options = extend(true, {}, {
		arguments: [],
		environment: {
			PATH: process.env.PATH
		},
		workingDirectory: path.resolve(`${__dirname}/..`)
	}, options);

	options.arguments.push(url);

	return new Promise((resolve, reject) => {
		const binFile = path.resolve(__dirname, '../../../bin/pa11y.js');

		const response = {
			exitCode: '',
			json: null,
			output: '',
			stderr: '',
			stdout: ''
		};

		const pa11yProcess = spawn('node', [binFile, ...options.arguments], {
			cwd: options.workingDirectory,
			env: options.environment
		});

		pa11yProcess.stdout.on('data', data => {
			response.stdout += data;
			response.output += data;
		});

		pa11yProcess.stderr.on('data', data => {
			response.stderr += data;
			response.output += data;
		});

		pa11yProcess.on('close', code => {
			response.exitCode = code;
			try {
				response.json = JSON.parse(response.stdout);
			} catch (error) {}
			resolve(response);
		});

		pa11yProcess.on('error', reject);
	});
};

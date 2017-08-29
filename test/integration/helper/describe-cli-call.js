'use strict';

const extend = require('node.extend');
const path = require('path');
const spawn = require('child_process').spawn;

module.exports = describeCliCall;

function describeCliCall(urlPath, cliArguments, environment, testFunction) {
	const argumentString = (cliArguments.length ? ` and arguments "${cliArguments.join(' ')}"` : '');
	describe(`call with url "${urlPath}"${argumentString}`, function() {
		before(function(done) {

			const that = this;
			that.lastStdout = '';
			that.lastStderr = '';
			that.lastOutput = '';
			environment = extend(true, environment, process.env);

			cliArguments.push(`http://localhost:${this.port}${urlPath}`);
			if (cliArguments.indexOf('--reporter') === -1 && cliArguments.indexOf('-r') === -1) {
				cliArguments.push('--reporter', 'json');
			}

			const child = spawn('../../bin/pa11y.js', cliArguments, {
				cwd: path.resolve(__dirname, '../'),
				env: environment
			});
			child.stdout.on('data', function(data) {
				that.lastStdout += data;
				that.lastOutput += data;
			});
			child.stderr.on('data', function(data) {
				that.lastStderr += data;
				that.lastOutput += data;
			});
			child.on('close', function(code) {
				that.lastJsonResponse = null;
				try {
					that.lastJsonResponse = JSON.parse(that.lastOutput);
				} catch (error) {}
				that.lastExitCode = code;
				done();
			});

		});
		testFunction.call(this);
	});
}

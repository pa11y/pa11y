'use strict';

var extend = require('node.extend');
var path = require('path');
var spawn = require('child_process').spawn;

module.exports = describeCliCall;

function describeCliCall(urlPath, cliArguments, environment, testFunction) {
	describe('call with url "' + urlPath + '"' + (cliArguments.length ? ' and arguments "' + cliArguments.join(' ') + '"' : ''), function() {
		before(function(done) {

			var that = this;
			that.lastStdout = '';
			that.lastStderr = '';
			that.lastOutput = '';
			environment = extend(true, environment, process.env);

			cliArguments.push('localhost:' + this.port + urlPath);
			if (cliArguments.indexOf('--reporter') === -1 && cliArguments.indexOf('-r') === -1) {
				cliArguments.push('--reporter', 'json');
			}

			var child = spawn('../../bin/pa11y', cliArguments, {
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
/* eslint-enable max-len, max-statements */

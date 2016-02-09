// jshint maxstatements: false
// jscs:disable maximumLineLength
'use strict';

var extend = require('node.extend');
var path = require('path');
var spawn = require('child_process').spawn;

module.exports = describeCliCall;

function describeCliCall(urlPath, cliArguments, environment, testFunction) {
	describe('call with url "' + urlPath + '"' + (cliArguments.length ? ' and arguments "' + cliArguments.join(' ') + '"' : ''), function() {
		before(function(done) {

			var self = this;
			self.lastStdout = '';
			self.lastStderr = '';
			self.lastOutput = '';
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
				self.lastStdout += data;
				self.lastOutput += data;
			});
			child.stderr.on('data', function(data) {
				self.lastStderr += data;
				self.lastOutput += data;
			});
			child.on('close', function(code) {
				self.lastJsonResponse = null;
				try {
					self.lastJsonResponse = JSON.parse(self.lastOutput);
				} catch (error) {}
				self.lastExitCode = code;
				done();
			});

		});
		testFunction.call(this);
	});
}


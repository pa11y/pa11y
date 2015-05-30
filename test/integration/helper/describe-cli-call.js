// This file is part of pa11y.
//
// pa11y is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// pa11y is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with pa11y.  If not, see <http://www.gnu.org/licenses/>.

// jshint maxstatements: false
// jscs:disable maximumLineLength
'use strict';

var extend = require('node.extend');
var path = require('path');
var spawn = require('child_process').spawn;

module.exports = describeCliCall;

function describeCliCall (urlPath, cliArguments, environment, testFunction) {
	describe('call with url "' + urlPath + '"' + (cliArguments.length ? ' and arguments "' + cliArguments.join(' ') + '"' : ''), function () {
		before(function (done) {

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
			child.stdout.on('data', function (data) {
				self.lastStdout += data;
				self.lastOutput += data;
			});
			child.stderr.on('data', function (data) {
				self.lastStderr += data;
				self.lastOutput += data;
			});
			child.on('close', function (code) {
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


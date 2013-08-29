/* jshint maxlen: 200, maxstatements: 50 */
'use strict';

// Dependencies
var exec = require('child_process').exec;
var net = require('net');
var pkg = require('../../../package');

// Step definitions
module.exports = function () {
	this.World = require('../support/world').World;

	// Paths
	var binPath = __dirname + '/../../../bin/pa11y';

	// Run the sniffer
	function sniff (url, opts, callback, execOpts) {

		// Resolve CLI opts
		var cliOpts = '--debug ';
		var opt;
		for (opt in opts) {
			if (opts.hasOwnProperty(opt)) {
				cliOpts += '--' + opt + ' ' + opts[opt] + ' ';
			}
		}

		if (!execOpts) {
			execOpts = {};
		}

		return exec(binPath + ' ' + cliOpts + url, execOpts, function (err, stdout, stderr) {
			callback(null, {
				err: err,
				stdout: stdout,
				stderr: stderr
			});
		});
	}

	this.When(/^I ask for help$/, function (callback) {
		var world = this;
		world.result = null;
		world.lastProcess = sniff('', {help: ''}, function (err, result) {
			if (err) { callback.fail(err); }
			world.result = result;
			callback();
		});
	});

	this.When(/^I ask for the program version$/, function (callback) {
		var world = this;
		world.result = null;
		world.lastProcess = sniff('', {version: ''}, function (err, result) {
			if (err) { callback.fail(err); }
			world.result = result;
			callback();
		});
	});

	this.When(/^I sniff an? ([a-z]+) URL$/i, function (urlType, callback) {
		var world = this;
		world.result = null;
		world.lastProcess = sniff(this.baseUrl + '/' + urlType, {}, function (err, result) {
			if (err) { callback.fail(err); }
			world.result = result;
			callback();
		});
	});

	this.When(/^I sniff an? ([a-z]+) URL \(and don't wait\)$/i, function (urlType, callback) {
		var world = this;
		world.result = null;
		world.lastProcess = sniff(this.baseUrl + '/' + urlType, {}, function () {});
		setTimeout(function () {
			callback();
		}, 500);
	});

	this.When(/^I sniff an? ([a-z]+) URL using the ([a-z\-]+) reporter$/i, function (urlType, reporter, callback) {
		var world = this;
		world.result = null;
		world.lastProcess = sniff(this.baseUrl + '/' + urlType, {reporter: reporter}, function (err, result) {
			if (err) { callback.fail(err); }
			world.result = result;
			callback();
		});
	});

	this.When(/^I sniff an? ([a-z]+) URL using the ([a-z0-9]+) standard$/i, function (urlType, standard, callback) {
		var world = this;
		world.result = null;
		world.lastProcess = sniff(this.baseUrl + '/' + urlType, {standard: standard}, function (err, result) {
			if (err) { callback.fail(err); }
			world.result = result;
			callback();
		});
	});

	this.When(/^I sniff an? ([a-z]+) URL using an? ([a-z0-9]+)ms timeout$/i, function (urlType, timeout, callback) {
		var world = this;
		world.result = null;
		world.lastProcess = sniff(this.baseUrl + '/' + urlType, {timeout: timeout}, function (err, result) {
			if (err) { callback.fail(err); }
			world.result = result;
			callback();
		});
	});

	this.When(/^I sniff an? ([a-z]+) URL using a config file with a relative path$/i, function (urlType, callback) {
		var world = this;
		world.result = null;
		world.lastProcess = sniff(this.baseUrl + '/' + urlType, {config: './config.json'}, function (err, result) {
			if (err) { callback.fail(err); }
			world.result = result;
			callback();
		}, {cwd: __dirname + '/../fixture'});
	});

	this.When(/^I sniff an? ([a-z]+) URL using a config file with an absolute path$/i, function (urlType, callback) {
		var world = this;
		world.result = null;
		world.lastProcess = sniff(this.baseUrl + '/' + urlType, {config: __dirname + '/../fixture/config.json'}, function (err, result) {
			if (err) { callback.fail(err); }
			world.result = result;
			callback();
		});
	});

	this.When(/^I sniff an? ([a-z]+) URL using a \.pa11yrc config file$/i, function (urlType, callback) {
		var world = this;
		world.result = null;
		world.lastProcess = sniff(this.baseUrl + '/' + urlType, {}, function (err, result) {
			if (err) { callback.fail(err); }
			world.result = result;
			callback();
		}, {cwd: __dirname + '/../fixture'});
	});

	this.When(/^I sniff an? ([a-z]+) URL using an invalid config file$/i, function (urlType, callback) {
		var world = this;
		world.result = null;
		world.lastProcess = sniff(this.baseUrl + '/' + urlType, {config: 'invalidconfig.json'}, function (err, result) {
			if (err) { callback.fail(err); }
			world.result = result;
			callback();
		});
	});

	this.When(/^I sniff an? ([a-z]+) URL using a useragent of "([^"]*)"$/i, function (urlType, useragent, callback) {
		var world = this;
		world.result = null;
		world.lastProcess = sniff(this.baseUrl + '/' + urlType, {useragent: useragent}, function (err, result) {
			if (err) { callback.fail(err); }
			world.result = result;
			callback();
		});
	});

	this.When(/^I sniff an? ([a-z]+) URL using a port of (\d+) \(and don't wait\)$/i, function (urlType, port, callback) {
		var world = this;
		world.result = null;
		world.lastProcess = sniff(this.baseUrl + '/' + urlType, {port: port}, function () {});
		setTimeout(function () {
			callback();
		}, 500);
	});

	this.Then(/^the command should be successful$/i, function (callback) {
		if (!this.result) {
			return callback.fail(new Error('No command was executed'));
		}
		if (this.result.err && this.result.err.code > 0) {
			return callback.fail(new Error('Command failed: ' + this.result.stderr));
		}
		callback();
	});

	this.Then(/^the command should fail$/i, function (callback) {
		if (!this.result) {
			return callback.fail(new Error('No command was executed'));
		}
		if (!this.result.err || this.result.err.code === 0) {
			return callback.fail(new Error('Command did not fail'));
		}
		callback();
	});

	this.Then(/^I should see "([^"]*)"$/i, function (text, callback) {
		if (!this.result) {
			return callback.fail(new Error('No command was executed'));
		}
		var inStdout = (this.result.stdout.toLowerCase().indexOf(text.toLowerCase()) !== -1);
		var inStderr = (this.result.stderr.toLowerCase().indexOf(text.toLowerCase()) !== -1);
		if (!inStdout && !inStderr) {
            return callback.fail(new Error('Text "' + text + '" not found in command output'));
        }
		callback();
	});

	this.Then(/^I should not see "([^"]*)"$/i, function (text, callback) {
		if (!this.result) {
			return callback.fail(new Error('No command was executed'));
		}
		var inStdout = (this.result.stdout.toLowerCase().indexOf(text.toLowerCase()) !== -1);
		var inStderr = (this.result.stderr.toLowerCase().indexOf(text.toLowerCase()) !== -1);
		if (inStdout || inStderr) {
            return callback.fail(new Error('Text "' + text + '" was found in command output'));
        }
		callback();
	});

	this.Then(/^I should see usage information$/i, function (callback) {
		if (!this.result) {
			return callback.fail(new Error('No command was executed'));
		}
		var seeUsage = (this.result.stdout.toLowerCase().indexOf('usage:') !== -1);
		var seeOptions = (this.result.stdout.toLowerCase().indexOf('options:') !== -1);
		if (!seeUsage && !seeOptions) {
            return callback.fail(new Error('Usage information not found in command output'));
        }
		callback();
	});

	this.Then(/^I should see the version number$/i, function (callback) {
		if (!this.result) {
			return callback.fail(new Error('No command was executed'));
		}
		if (this.result.stdout.trim() !== pkg.version) {
            return callback.fail(new Error('Version number not found in command output'));
        }
		callback();
	});

	this.Then(/^the response should be valid JSON$/i, function (callback) {
		if (!this.result) {
			return callback.fail(new Error('No command was executed'));
		}
		try {
			this.result.json = JSON.parse(this.result.stdout);
		} catch (err) {
			return callback.fail(new Error('Response is not valid JSON'));
		}
		callback();
	});

	this.Then(/^the user agent should be set to match the pa11y version number$/i, function (callback) {
		var actualUseragent = this.app.get('lastUseragent');
		var expectedUseragent = 'pa11y/' + pkg.version;
		if (actualUseragent !== expectedUseragent) {
			return callback.fail(new Error('User Agent "' + actualUseragent + '" does not match "' + expectedUseragent + '"'));
		}
		callback();
	});

	this.Then(/^the user agent should be set to "([^"]*)"$/i, function (expectedUseragent, callback) {
		var actualUseragent = this.app.get('lastUseragent');
		if (actualUseragent !== expectedUseragent) {
			return callback.fail(new Error('User Agent "' + actualUseragent + '" does not match "' + expectedUseragent + '"'));
		}
		callback();
	});

	// Test whether a port is in use
	function testPort (port, callback) {
		var tester = net.createServer();
		tester.once('error', function (err) {
			if (err.code === 'EADDRINUSE') {
				callback(null, true);
			} else {
				callback(err);
			}
		});
		tester.once('listening', function() {
			tester.once('close', function() {
				callback(null, false);
			});
			tester.close();
		});
		tester.listen(port);
	}

	this.Then(/^port (\d+) should be in use$/i, function (port, callback) {
		var world = this;
		testPort(port, function (err, isPortTaken) {
			if (!isPortTaken) {
				return callback.fail(new Error('Port ' + port + ' is not in use'));
			}
			if (world.lastProcess) {
				world.lastProcess.kill();
			}
			callback();
		});
	});

};

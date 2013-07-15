/*jshint maxlen:160 */
'use strict';

// Dependencies
var exec = require('child_process').exec;
var pkg = require('../../../package');

// Step definitions
module.exports = function () {
	this.World = require('../support/world').World;

	// Paths
	var binPath = __dirname + '/../../../bin/pa11y';

	// Run the sniffer
	function sniff (url, opts, callback) {

		// Resolve CLI opts
		var cliOpts = '--debug ';
		var opt;
		for (opt in opts) {
			if (opts.hasOwnProperty(opt)) {
				cliOpts += '--' + opt + ' ' + opts[opt] + ' ';
			}
		}

		exec(binPath + ' ' + cliOpts + url, function (err, stdout, stderr) {
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
		sniff('', {help: ''}, function (err, result) {
			if (err) { callback.fail(err); }
			world.result = result;
			callback();
		});
	});

	this.When(/^I ask for the program version$/, function (callback) {
		var world = this;
		world.result = null;
		sniff('', {version: ''}, function (err, result) {
			if (err) { callback.fail(err); }
			world.result = result;
			callback();
		});
	});

	this.When(/^I sniff an? ([a-z]+) URL$/i, function (urlType, callback) {
		var world = this;
		world.result = null;
		sniff(this.baseUrl + '/' + urlType, {}, function (err, result) {
			if (err) { callback.fail(err); }
			world.result = result;
			callback();
		});
	});

	this.When(/^I sniff an? ([a-z]+) URL using the ([a-z\-]+) reporter$/i, function (urlType, reporter, callback) {
		var world = this;
		world.result = null;
		sniff(this.baseUrl + '/' + urlType, {reporter: reporter}, function (err, result) {
			if (err) { callback.fail(err); }
			world.result = result;
			callback();
		});
	});

	this.When(/^I sniff an? ([a-z]+) URL using the ([a-z0-9]+) standard$/i, function (urlType, standard, callback) {
		var world = this;
		world.result = null;
		sniff(this.baseUrl + '/' + urlType, {standard: standard}, function (err, result) {
			if (err) { callback.fail(err); }
			world.result = result;
			callback();
		});
	});

	this.When(/^I sniff an? ([a-z]+) URL using an? ([a-z0-9]+)ms timeout$/i, function (urlType, timeout, callback) {
		var world = this;
		world.result = null;
		sniff(this.baseUrl + '/' + urlType, {timeout: timeout}, function (err, result) {
			if (err) { callback.fail(err); }
			world.result = result;
			callback();
		});
	});

	this.Then(/^the command should be successful$/i, function (callback) {
		if (!this.result) {
			return callback.fail(new Error('No command was executed'));
		}
		if (this.result.stderr) {
			return callback.fail(new Error('Command failed: ' + this.result.stderr));
		}
		callback();
	});

	this.Then(/^the command should fail$/i, function (callback) {
		if (!this.result) {
			return callback.fail(new Error('No command was executed'));
		}
		if (!this.result.stderr) {
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

};

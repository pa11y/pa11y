/* globals window */
'use strict';

var async = require('async');
var handleResult = require('./sniff/handle-result');
var loadReporter = require('./sniff/load-reporter');
var loadUrl = require('./sniff/load-url');
var manageOptions = require('./sniff/manage-options');
var wait = require('./phantom-wait').wait;

// Sniff a page
exports.sniff = function (opts, callback) {

	var self = {};

	async.series([

		// Manage options
		function (next) {
			manageOptions(opts, function (err, opts) {
				self.opts = opts;
				next(err);
			});
		},

		// Load the expected reporter
		function (next) {
			loadReporter(self.opts.reporter, function (err, reporter) {
				if (err) {
					console.error('Error: Reporter ' + self.opts.reporter + ' not found');
				} else {
					self.reporter = reporter;
				}
				next(err);
			});
		},

		// Awaiting refactor
		function (next) {
			begin(self, next);
		},

		// Load the page
		function (next) {
			loadUrl(self.opts.url, function (err, browser, page) {
				self.browser = browser;
				self.page = page;
				next(err);
			});
		},

		// Awaiting refactor
		function (next) {
			setupVars(self, next);
		},
		function (next) {
			loadScript(self, next);
		},
		function (next) {
			runSniffer(self, next);
		},
		function (next) {
			getMessages(self, next);
		},

		// Handle CodeSniffer results
		function (next) {
			handleResult(self.messages, function (err, results) {
				self.results = results;
				next(err);
			});
		},

		// "Sign off"
		function (next) {
			self.reporter.log('Done');
			self.reporter.handleResult(self.results);
			self.reporter.end();
			next(null);
		}

	], function (err) {
		if (err && self.reporter) {
			self.reporter.error(err.message);
		}
		if (self.browser) {
			self.browser.exit();
		}
		callback(err, self.results);
	});

};

// Begin
function begin (self, next) {
	self.reporter.begin();

	// Timeout
	if (self.opts.debug) {
		self.reporter.debug('Starting timeout timer (' + self.timeout + 'ms)');
	}
	self.timer = setTimeout(function () {
		if (self.browser) {
			self.browser.exit();
		}
		self.reporter.error('PhantomJS timeout');
		self.reporter.end();
		process.exit(1);
	}, self.opts.timeout);

	next(null, self);
}

// Set up required variables in our page
function setupVars (self, next) {
	if (self.opts.debug) {
		self.reporter.debug('Passing configurations to page');
	}
	self.page.evaluate(function (vars) {
		window.__pa11y = vars;
	}, function () {
		next(null, self);
	}, {
		isComplete: false,
		standard: self.opts.standard
	});
}

// Load the script
function loadScript (self, next) {
	self.reporter.log('Loading HTML CodeSniffer...');
	self.page.includeJs(self.opts.htmlcs, function () {
		wait(self.page, function () {
			return (typeof window.HTMLCS !== 'undefined');
		}, function () {
			next(null, self);
		});
	});
}

// Run the sniffer
function runSniffer (self, next) {
	self.reporter.log('Running HTML CodeSniffer...');
	self.page.evaluate(function () {
		window.HTMLCS.process(window.__pa11y.standard, window.document, function () {
			window.__pa11y.isComplete = true;
		});
	}, function () {
		wait(self.page, function () {
			return (window.__pa11y.isComplete === true);
		}, function () {
			next(null, self);
		});
	});
}

// Get messages
function getMessages (self, next) {
	if (self.opts.debug) {
		self.reporter.debug('Retrieving HTML CodeSniffer messages');
	}
	self.page.evaluate(function () {
		return window.HTMLCS.getMessages();
	}, function (messages) {
		clearTimeout(self.timer);
		self.messages = messages;
		next(null, self);
	});
}

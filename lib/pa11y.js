/* globals window */
'use strict';

var _ = require('underscore');
var async = require('async');
var buildResult = require('./results').build;
var loadReporter = require('./reporter').load;
var phantom = require('phantom');
var sanitizeUrl = require('./url').sanitize;
var wait = require('./phantom-wait').wait;

// Option defaulting
var defaultOpts = {
    debug: false,
    htmlcs: 'http://squizlabs.github.io/HTML_CodeSniffer/build/HTMLCS.js',
    reporter: 'console',
    standard: 'WCAG2AA',
    timeout: 30000
};
exports.applyDefaultOpts = function (opts) {
	return _.extend({}, defaultOpts, opts);
};

// Option validation
var acceptableStandards = ['Section508', 'WCAG2A', 'WCAG2AA', 'WCAG2AAA'];
exports.validateOpts = function (opts) {
	var timeout = parseInt(opts.timeout, 10);
	if (isNaN(timeout) || timeout === Infinity) {
		return false;
	}
	if (acceptableStandards.indexOf(opts.standard) === -1) {
		return false;
	}
	return true;
};

// Sniff a page
exports.sniff = function (opts, callback) {
	var self = exports.applyDefaultOpts(opts);
	if (!exports.validateOpts(self)) {
		var err = new Error('Invalid options');
		err.showHelp = true;
		return callback(err);
	}
	self.url = sanitizeUrl(self.url);
	loadReporter(self.reporter, function (err, reporter) {
		if (err) {
			console.error('Error: Reporter ' + self.reporter + ' not found');
			callback(err);
		}
		self.reporter = reporter;
		async.waterfall([
			begin.bind(null, self),
			createBrowser,
			createPage,
			openUrl,
			setupVars,
			loadScript,
			runSniffer,
			getMessages
		], function (err, result) {
			end(err, result, callback);
		});
	});
};

// Begin
function begin (self, next) {
	self.reporter.begin();

	// Timeout
	if (self.debug) {
		self.reporter.debug('Starting timeout timer (' + self.timeout + 'ms)');
	}
	self.timer = setTimeout(function () {
		if (self.browser) {
			self.browser.exit();
		}
		self.reporter.error('PhantomJS timeout');
		self.reporter.end();
		process.exit(1);
	}, self.timeout);

	next(null, self);
}

// Create a browser
function createBrowser (self, next) {
	if (self.debug) {
		self.reporter.debug('Creating PhantomJS browser');
	}
	phantom.create(function (browser) {
		self.browser = browser;
		next(null, self);
	});
}

// Create a page
function createPage (self, next) {
	if (self.debug) {
		self.reporter.debug('Creating PhantomJS page');
	}
	self.browser.createPage(function (page) {
		self.page = page;
		next(null, self);
	});
}

// Open the URL
function openUrl (self, next) {
	self.reporter.log('Loading page...');
	self.page.open(self.url, function (status) {
		if (status === 'fail') {
			next(new Error('URL could not be loaded'), self);
		} else {
			next(null, self);
		}
	});
}

// Set up required variables in our page
function setupVars (self, next) {
	if (self.debug) {
		self.reporter.debug('Passing configurations to page');
	}
	self.page.evaluate(function (vars) {
		window.__pa11y = vars;
	}, function () {
		next(null, self);
	}, {
		isComplete: false,
		standard: self.standard
	});
}

// Load the script
function loadScript (self, next) {
	self.reporter.log('Loading HTML CodeSniffer...');
	self.page.includeJs(self.htmlcs, function () {
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
	if (self.debug) {
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

// End
function end (err, self, callback) {
	if (self.browser) {
		self.browser.exit();
	}
	if (err) {
		self.reporter.error(err.message);
	} else {
		self.results = buildResult(self.messages);
		self.reporter.log('Done');
		self.reporter.handleResult(self.results);
	}
	self.reporter.end();
	callback(err, self.results);
}

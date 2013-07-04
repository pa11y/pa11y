/* globals window */
'use strict';

// Dependencies
var async = require('async');
var phantom = require('phantom');
var buildResult = require('./results').build;
var sanitizeUrl = require('./url').sanitize;
var wait = require('./phantom-wait').wait;

// Sniff a page
exports.sniff = function (opts, callback) {
	var self = {
		url: sanitizeUrl(opts.url),
		standard: opts.standard,
		reporter: opts.reporter,
		htmlcs: opts.htmlcs,
		timeout: opts.timeout,
		debug: opts.debug
	};
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
		self.reporter.log('Done');
		self.reporter.handleResult(buildResult(self.messages));
	}
	self.reporter.end();
	callback(err, self);
}

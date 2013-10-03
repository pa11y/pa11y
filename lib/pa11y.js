'use strict';

var _ = require('underscore');
var async = require('async');
var handleResult = require('./sniff/handle-result');
var loadConfig = require('./sniff/load-config');
var loadReporter = require('./sniff/load-reporter');
var loadUrl = require('./sniff/load-url');
var manageOptions = require('./sniff/manage-options');
var runHtmlCodeSniffer = require('./sniff/run-html-codesniffer');

// Sniff a page
exports.sniff = function (opts, callback) {

	var self = {
		isDone: false
	};

	var done = _.once(function (err) {
		self.isDone = true;
		if (err) {
			clearTimeout(self.timer);
			if (self.reporter) {
				self.reporter.error(err.message);
			} else {
				console.error('Error: ' + err.message);
			}
		}
		if (self.reporter) {
			self.reporter.end();
		}
		if (self.browser) {
			self.browser.exit();
		}
		callback(err, self.results);
	});

	async.series([

		// Manage options
		function (next) {
			manageOptions(opts, function (err, opts) {
				self.opts = opts;
				next(err);
			});
		},

		// Load and start the expected reporter
		function (next) {
			if (_.isString(self.opts.reporter)) {
				loadReporter(self.opts.reporter, function (err, reporter) {
					if (err) {
						return next(new Error('Reporter ' + self.opts.reporter + ' not found'));
					}
					self.reporter = reporter;
					self.reporter.begin();
					next();
				});
			} else if (self.opts.reporter !== null && _.isObject(self.opts.reporter)) {
				self.reporter = loadReporter.sanitize(self.opts.reporter);
				next();
			} else {
				self.reporter = loadReporter.sanitize({});
				next();
			}
		},

		// Load configurations
		function (next) {
			if (_.isString(self.opts.config)) {
				loadConfig(self.opts.config, function (err, config) {
					self.config = config;
					next(err);
				});
			} else if (self.opts.config !== null && _.isObject(self.opts.config)) {
				self.config = loadConfig.sanitize(self.opts.config);
				next();
			} else {
				self.config = loadConfig.sanitize({});
				next();
			}
		},

		// Set up a timer for throwing timeout errors
		function (next) {
			if (self.opts.debug) {
				self.reporter.debug('Starting timeout timer (' + self.opts.timeout + 'ms)');
			}
			self.timerStartTime = (new Date()).getTime();
			self.timer = setTimeout(function () {
				if (self.browser) {
					self.browser.exit();
				}
				done(new Error('PhantomJS timeout'));
			}, self.opts.timeout);
			next(null);
		},

		// Load the page
		function (next) {
			if (self.isDone) {
				return next(new Error('pa11y has already finished running'));
			}
			var opts = self.opts;
			self.reporter.log('Loading page...');
			loadUrl(opts.url, opts.useragent, opts.port, function (err, browser, page) {
				self.browser = browser;
				self.page = page;
				next(err);
			});
		},

		// Load and run HTML CodeSniffer
		function (next) {
			if (self.isDone) {
				return next(new Error('pa11y has already finished running'));
			}
			self.reporter.log('Running HTML CodeSniffer...');
			runHtmlCodeSniffer(self.page, self.opts, function (err, messages) {
				if (err) {
					self.messages = [];
					return next(err);
				}
				self.messages = messages.filter(function (msg) {
					return (self.config.ignore.indexOf(msg.code) === -1);
				});
				next(null);
			});
		},

		// Clear the timeout
		function (next) {
			clearTimeout(self.timer);
			if (self.opts.debug) {
				var elapsedTime = (new Date()).getTime() - self.timerStartTime;
				self.reporter.debug('Timeout cleared (in ' + elapsedTime + 'ms)');
			}
			next(null);
		},

		// Handle CodeSniffer results
		function (next) {
			if (self.opts.debug) {
				self.reporter.debug('Handling HTML CodeSniffer results');
			}
			handleResult(self.messages, function (err, results) {
				self.results = results;
				next(err);
			});
		},

		// "Sign off"
		function (next) {
			self.reporter.log('Done');
			self.reporter.handleResult(self.results);
			next(null);
		}

	], done);

};

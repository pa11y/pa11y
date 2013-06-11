'use strict';

// Dependencies
require('colors');

// Output indicator
var out = ' > '.cyan;

// Handle begin messaging
exports.begin = function () {
	console.log('\nWelcome to Pa11y'.cyan.underline);
	console.log('We\'ll sniff your page for you now.\n'.grey);
};

// Handle a log message
exports.log = function (msg) {
	console.log(out + msg);
};

// Handle a debug message
exports.debug = function (msg) {
	console.log(out + ('debug: ' + msg).grey);
};

// Handle an error
exports.error = function (msg) {
	console.error(out + ('Error: ' + msg).red);
};

// Handle results
exports.handleResult = function (result) {
	if (!result.isPerfect) {
		console.log(('\nResults (' + result.count.total + '):\n').grey);
		result.results.forEach(function (res) {
			var message = res.message;
			if (res.type === 'error') {
				message = message.red;
			} else if (res.type === 'warning') {
				message = message.yellow;
			}
			console.log(out + message);
		});
	} else {
		console.log('\nNo errors found!'.green);
	}
};

// Handle end messaging
exports.end = function () {
	console.log();
};

'use strict';

// Dependencies
var _ = require('underscore');
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
		var groupedResults = _.groupBy(result.results, function (res) {
			return res.code;
		});
		_.each(groupedResults, function (res) {
			var code = res[0].code;
			var count = (res.length > 1 ? (' (' + res.length + ' occurences)').cyan : '');
			var message = res[0].message.grey;
			if (res[0].type === 'error') {
				code = code.red;
			} else if (res[0].type === 'warning') {
				code = code.yellow;
			}
			console.log(out + code + count);
			console.log('   ' + message);
		});
	} else {
		console.log('\nNo errors found!'.green);
	}
};

// Handle end messaging
exports.end = function () {
	console.log();
};

'use strict';

// Handle a log message (do nothing)
exports.log = function () {};

// Handle an error
exports.error = function (msg) {
	console.error(('Error: ' + msg).red);
};

// Handle result
exports.handleResult = function (result) {
	console.log(JSON.stringify(result));
};

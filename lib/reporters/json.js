'use strict';

// Handle an error
exports.error = function (msg) {
	console.error(('Error: ' + msg).red);
};

// Handle result
exports.handleResult = function (result) {
	console.log(JSON.stringify(result));
};

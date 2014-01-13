'use strict';

// Handle an error
exports.error = function (msg) {
	console.error(('Error: ' + msg).red);
};

// Handle result
exports.handleResult = function (result) {

	// Output header
	console.log('"code","message","type"');

	// Loop results
	result.results.forEach(function (res) {
		console.log([
			JSON.stringify(res.code),
			JSON.stringify(res.message),
			JSON.stringify(res.type)
		].join(','));
	});

};

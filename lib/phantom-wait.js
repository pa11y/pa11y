'use strict';

// Wait for a script to evaluate true
exports.wait = function (page, expression, callback) {
	var interval = setInterval(function () {
		page.evaluate(expression, function (result) {
			if (result === true) {
				clearInterval(interval);
				callback();
			}
		});
	}, 50);
};

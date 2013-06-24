'use strict';

// Sanitize a URL (ensure it has a scheme and remove hash)
exports.sanitize = function (url) {
	if (!/^[a-z]+:\/\//i.test(url)) {
		url = 'http://' + url;
	}
	return url;
};

'use strict';

// Sanitize a URL ready for reporting
exports.sanitize = function (url) {
	if (!/^[a-z]+:\/\//i.test(url)) {
		url = 'http://' + url;
	}
	return url;
};

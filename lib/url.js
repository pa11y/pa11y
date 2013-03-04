'use strict';

// Stuff in here is temporary, until we can communicate
// with PhantomJS in a cleaner way.

// Dependencies
var querystring = require('querystring');

// Sanitize a URL (ensure it has a scheme and remove hash)
exports.sanitize = function (url) {
	if (!/^[a-z]+:\/\//i.test(url)) {
		url = 'http://' + url;
	}
	if (url.indexOf('#') !== -1) {
		url = url.substr(0, url.indexOf('#'));
	}
	return url;
};

// Append extra variables to the query-string
exports.appendQuery = function (url, params) {
	var query = querystring.stringify(params);
	if (url.indexOf('?') !== -1) {
		url = url.replace(/^([^\?]+)\?/, '$1?' + query + '&');
	} else {
		url += '?' + query;
	}
	return url;
};

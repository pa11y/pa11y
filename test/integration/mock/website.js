'use strict';

var fs = require('fs');
var http = require('http');
var parseUrl = require('url').parse;
var path = require('path');

module.exports = startWebsite;

function startWebsite(port, done) {
	var website = http.createServer(function(request, response) {
		var url = parseUrl(request.url).pathname;
		try {
			var html = fs.readFileSync(path.join(__dirname, '/html/' + url + '.html'), 'utf-8');
			html = html.replace('{foo-header}', request.headers.foo);
			response.writeHead(200, {
				'Content-Type': 'text/html'
			});
			response.end(html);
		} catch (error) {
			response.writeHead(404);
			response.end('Not found');
		}
	});
	website.listen(port, function(error) {
		done(error, website);
	});
}

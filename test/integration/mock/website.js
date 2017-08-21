'use strict';

const fs = require('fs');
const http = require('http');
const parseUrl = require('url').parse;
const path = require('path');

module.exports = startWebsite;

function startWebsite(port, done) {
	const website = http.createServer((request, response) => {
		const url = parseUrl(request.url).pathname;
		try {
			let html = fs.readFileSync(`${__dirname}/html/${url}.html`, 'utf-8');
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
	website.listen(port, error => {
		done(error, website);
	});
}

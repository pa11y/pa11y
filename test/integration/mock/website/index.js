'use strict';

const fs = require('fs');
const http = require('http');
const parseUrl = require('url').parse;

module.exports = startWebsite;

function startWebsite(port, done) {

	const server = http.createServer((request, response) => {

		const urlPath = parseUrl(request.url).pathname;
		const viewPath = `${__dirname}/html${urlPath}.html`;

		if (urlPath.includes('.xml')) {
			response.writeHead(200, {
				'Content-Type': 'text/xml'
			});
			return response.end(fs.readFileSync(`${__dirname}/${urlPath}`, 'utf-8'));
		}

		try {
			const html = fs.readFileSync(viewPath, 'utf-8');
			response.writeHead(200, {
				'Content-Type': 'text/html'
			});
			response.end(html);
		} catch (error) {
			response.writeHead(404);
			response.end('Not found');
		}

	});

	server.listen(port, error => {
		done(error, server);
	});

}

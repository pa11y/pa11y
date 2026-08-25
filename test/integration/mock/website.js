'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');

module.exports = startMockWebsite;

function startMockWebsite(port) {
	return new Promise((resolve, reject) => {
		const website = createMockWebsite();
		website.listen(port, error => {
			if (error) {
				return reject(error);
			}
			resolve(website);
		});
	});
}

function createMockWebsite() {
	return http.createServer((request, response) => {
		// Set CORS headers to allow Private Network Access (PNA) preflights
		// Required for Chrome 104+ on Windows which enforces PNA security
		const corsHeaders = {
			'Access-Control-Allow-Origin': request.headers.origin || '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Request-Private-Network',
			'Access-Control-Allow-Private-Network': 'true',
			'Access-Control-Max-Age': '3600'
		};

		// Handle CORS preflight requests (OPTIONS)
		if (request.method === 'OPTIONS') {
			response.writeHead(200, corsHeaders);
			response.end();
			return;
		}

		request.body = '';

		// Grab POST data if there is any
		request.on('data', data => {
			request.body += data;
		});
		request.on('end', () => {
			const url = new URL(request.url, 'http://127.0.0.1').pathname;
			try {
				const viewPath = path.join(__dirname, 'html', `${url}.html`);
				let html = fs.readFileSync(viewPath, 'utf-8');
				html = html.replace('{foo-header}', request.headers.foo);
				html = html.replace('{bar-header}', request.headers.bar);
				html = html.replace('{method}', request.method);
				html = html.replace('{post-data}', request.body);
				response.writeHead(200, {
					'Content-Type': 'text/html',
					...corsHeaders
				});
				response.end(html);
			} catch {
				response.writeHead(404, corsHeaders);
				response.end('Not found');
			}
		});

	});
}

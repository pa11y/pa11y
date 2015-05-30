// This file is part of pa11y.
//
// pa11y is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// pa11y is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with pa11y.  If not, see <http://www.gnu.org/licenses/>.

'use strict';

var fs = require('fs');
var http = require('http');
var parseUrl = require('url').parse;

module.exports = startWebsite;

function startWebsite (port, done) {
	var website = http.createServer(function (request, response) {
		var url = parseUrl(request.url).pathname;
		try {
			var html = fs.readFileSync(__dirname + '/html/' + url + '.html', 'utf-8');
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
	website.listen(port, function (error) {
		done(error, website);
	});
}

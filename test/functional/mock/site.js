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

/* jshint maxlen: false, maxstatements: false */
'use strict';

var express = require('express');
var querystring = require('querystring');

module.exports = initSite;

function initSite (done) {

	var app = express();
	var port = 4117;

	app.lastUseragent = null;
	app.use(function (req, res, next) {
		app.lastUseragent = req.headers['user-agent'];
		next();
	});

	app.get('/normal', function (req, res) {
		res.send(
			'<html lang="en">' +
				'<head><title>Title</title></head>' +
				'<body>' +
					'Body ' +
					'<img src="" alt="my image"/>' +
				'</body>' +
			'</html>'
		);
	});

	app.get('/failing', function (req, res) {
		res.send(
			'<html>' +
				'<head><title>Title</title></head>' +
				'<body>' +
					'Body ' +
				'</body>' +
			'</html>'
		);
	});

	app.get('/redirecting', function (req, res) {
		res.redirect('/normal');
	});

	app.listen(port, function (err) {
		done(err, app);
	});

}

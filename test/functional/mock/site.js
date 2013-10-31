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

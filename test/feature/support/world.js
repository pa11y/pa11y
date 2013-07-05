'use strict';

// Dependencies
var express = require('express');
var querystring = require('querystring');

// Create app
var app = express();
var port = 4117;

// Routes
app.get('/normal', function (req, res) {
	res.send('<html><head><title>Title</title></head><body>Body</body></html>');
});
app.get('/redirecting', function (req, res) {
	res.redirect('/normal?' + querystring.stringify(req.query));
});
app.get('/invalid', function (req, res) {
	res.redirect('http://localhost:12345678/thishadbetternotbearealurl');
});

app.listen(port, function (err) {
	if (err) { throw err; }
});

// Create world
exports.World = function (callback) {
	var world = this;
	world.app = app;
	world.baseUrl = 'http://localhost:' + port;
	world.result = null;
	callback();
};

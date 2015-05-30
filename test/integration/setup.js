/* jshint maxstatements: false */
/* global before */
// jscs:disable maximumLineLength
'use strict';

var startWebsite = require('./mock/website');

before(function (done) {
	this.port = process.env.PORT || 3131;
	startWebsite(this.port, done);
});

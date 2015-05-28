/* jshint maxstatements: false, maxlen: false */
/* global before */
'use strict';

var startWebsite = require('./mock/website');

before(function (done) {
	this.port = process.env.PORT || 3131;
	startWebsite(this.port, done);
});

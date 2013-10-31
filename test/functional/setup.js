/* jshint maxlen: false, maxstatements: false */
/* global before */
'use strict';

var initSite = require('./mock/site');

before(function (done) {
	var that = this;
	initSite(function (err, site) {
		that.site = site;
		done(err);
	});
});

/* jshint maxlen: 200, maxstatements: 20 */
/* global afterEach, beforeEach, describe, it */
'use strict';

var assert = require('proclaim');
var phantom = require('phantom');
var sinon = require('sinon');

describe('sniff/load-url', function () {
	var loadUrl = require('../../../lib/sniff/load-url');
	var page, browser;

	beforeEach(function () {
		page = {
			open: sinon.stub(),
			set: sinon.spy()
		};
		page.open.withArgs('successfulpage').callsArgWithAsync(1, 'success');
		page.open.withArgs('failingpage').callsArgWithAsync(1, 'fail');
		browser = {
			createPage: sinon.stub().callsArgWithAsync(0, page)
		};
		sinon.stub(phantom, 'create').callsArgWithAsync(1, browser);
	});

	afterEach(function () {
		phantom.create.restore();
	});

	it('should be a function', function () {
		assert.isFunction(loadUrl);
	});

	it('should create a phantom page and open the given URL', function (done) {
		loadUrl('successfulpage', 'ua', 1234, function () {
			assert.isTrue(phantom.create.calledOnce);
			assert.isTrue(browser.createPage.calledOnce);
			assert.isTrue(page.open.withArgs('successfulpage').calledOnce);
			done();
		});
	});

	it('should set the user agent string', function (done) {
		loadUrl('successfulpage', 'ua', 1234, function () {
			assert.isTrue(page.set.withArgs('settings.userAgent', 'ua').calledOnce);
			done();
		});
	});

	it('should set the port', function (done) {
		loadUrl('successfulpage', 'ua', 1234, function () {
			assert.isTrue(phantom.create.calledOnce);
			assert.strictEqual(phantom.create.firstCall.args[0].port, 1234);
			done();
		});
	});

	it('should callback with the phantom browser and page', function (done) {
		loadUrl('successfulpage', 'ua', 1234, function (err, br, pa) {
			assert.strictEqual(br, browser);
			assert.strictEqual(pa, page);
			done();
		});
	});

	it('should callback with an error if the page fails to load', function (done) {
		loadUrl('failingpage', 'ua', 1234, function (err) {
			assert.isInstanceOf(err, Error);
			done();
		});
	});

});

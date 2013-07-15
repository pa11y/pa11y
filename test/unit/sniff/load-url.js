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
		page = {open: sinon.stub()};
		page.open.withArgs('successfulpage').callsArgWith(1, 'success');
		page.open.withArgs('failingpage').callsArgWith(1, 'fail');
		browser = {
			createPage: sinon.stub().callsArgWith(0, page)
		};
		sinon.stub(phantom, 'create').callsArgWith(0, browser);
	});

	afterEach(function () {
		phantom.create.restore();
	});

	it('should be a function', function () {
		assert.isFunction(loadUrl);
	});

	it('should create a phantom page and open the given URL', function (done) {
		loadUrl('successfulpage', function () {
			assert.isTrue(phantom.create.calledOnce);
			assert.isTrue(browser.createPage.calledOnce);
			assert.isTrue(page.open.withArgs('successfulpage').calledOnce);
			done();
		});
	});

	it('should callback with the phantom browser and page', function (done) {
		loadUrl('successfulpage', function (err, br, pa) {
			assert.strictEqual(br, browser);
			assert.strictEqual(pa, page);
			done();
		});
	});

	it('should callback with an error if the page fails to load', function (done) {
		loadUrl('failingpage', function (err) {
			assert.isInstanceOf(err, Error);
			done();
		});
	});

});

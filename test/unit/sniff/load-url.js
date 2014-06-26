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

/* jshint maxlen: 200, maxstatements: 20 */
/* global afterEach, beforeEach, describe, it */
'use strict';

var assert = require('proclaim');
var phantom = require('phantom');
var sinon = require('sinon');

describe('sniff/load-url', function () {
	var loadUrl = require('../../../lib/sniff/load-url');
	var page, browser, options;

	beforeEach(function () {
		page = {
			open: sinon.stub(),
			set: sinon.spy()
		};
		page.open.withArgs('successfulpage').callsArgWithAsync(1, 'success');
		page.open.withArgs('failingpage').callsArgWithAsync(1, 'fail');
		browser = {
			addCookie: sinon.stub(),
			createPage: sinon.stub().callsArgWithAsync(0, page)
		};
		sinon.stub(phantom, 'create').callsArgWithAsync(1, browser);

		options = {
			userAgent: 'ua',
			port: 1234,
			cookies: [],
			viewport: {
				height: 1000,
				width: 2000,
			}
		};
	});

	afterEach(function () {
		phantom.create.restore();
	});

	it('should be a function', function () {
		assert.isFunction(loadUrl);
	});

	it('should create a phantom page and open the given URL', function (done) {
		loadUrl('successfulpage', options, function () {
			assert.isTrue(phantom.create.calledOnce);
			assert.isFalse(browser.addCookie.called);
			assert.isTrue(browser.createPage.calledOnce);
			assert.isTrue(page.open.withArgs('successfulpage').calledOnce);
			done();
		});
	});

	it('should pass the cookies to the browser', function (done) {
		options.cookies = [
			{
				'name': 'foo',
				'value': 'bar',
				'domain': 'localhost'
			},
			{
				'name': 'baz',
				'value': 'qux',
				'domain': 'localhost'
			}
		];

		loadUrl('successfulpage', options, function () {
			assert.isTrue(browser.addCookie.calledTwice);
			assert.isTrue(browser.addCookie.withArgs('foo', 'bar', 'localhost').calledOnce);
			assert.isTrue(browser.addCookie.withArgs('baz', 'qux', 'localhost').calledOnce);
			done();
		});
	});

	it('should set the user agent string', function (done) {
		loadUrl('successfulpage', options, function () {
			assert.isTrue(page.set.withArgs('settings.userAgent', 'ua').calledOnce);
			done();
		});
	});


	it('should set the viewport size', function (done) {
		loadUrl('successfulpage', options, function () {
			assert.isTrue(page.set.withArgs('viewportSize', {
				height: 1000,
				width: 2000,
			}).calledOnce);
			done();
		});
	});

	it('should set the port', function (done) {
		loadUrl('successfulpage', options, function () {
			assert.isTrue(phantom.create.calledOnce);
			assert.strictEqual(phantom.create.firstCall.args[0].port, 1234);
			done();
		});
	});

	it('should callback with the phantom browser and page', function (done) {
		loadUrl('successfulpage', options, function (err, br, pa) {
			assert.strictEqual(br, browser);
			assert.strictEqual(pa, page);
			done();
		});
	});

	it('should callback with an error if the page fails to load', function (done) {
		loadUrl('failingpage', options, function (err) {
			assert.isInstanceOf(err, Error);
			done();
		});
	});

});

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
/* global afterEach, beforeEach, describe, global, it */
'use strict';

var assert = require('proclaim');
var sinon = require('sinon');
var phantomWait = require('../../../lib/phantom-wait');

describe('sniff/run-html-codesniffer', function () {
	var runHtmlCodeSniffer = require('../../../lib/sniff/run-html-codesniffer');
	var page, opts, messages;

	beforeEach(function () {
		messages = [];
		global.window = {
			document: {},
			HTMLCS: {
				process: sinon.stub().callsArg(2),
				getMessages: sinon.stub().returns(messages)
			}
		};
		page = {
			evaluate: sinon.spy(function (expression, callback, vars) {
				callback(expression(vars));
			}),
			includeJs: sinon.stub().callsArg(1)
		};
		opts = {
			htmlcs: 'foo',
			standard: 'bar'
		};
		sinon.stub(phantomWait, 'wait').callsArg(2);
	});

	afterEach(function () {
		phantomWait.wait.restore();
	});

	it('should be a function', function () {
		assert.isFunction(runHtmlCodeSniffer);
	});

	it('should set the expected variables on the window', function (done) {
		runHtmlCodeSniffer(page, opts, function () {
			assert.deepEqual(global.window.__pa11y.standard, opts.standard);
			done();
		});
	});

	it('should include the HTML CodeSniffer JavaScript in the page', function (done) {
		runHtmlCodeSniffer(page, opts, function () {
			assert.isTrue(page.includeJs.withArgs(opts.htmlcs).calledOnce);
			done();
		});
	});

	it('should run HTML CodeSniffer', function (done) {
		runHtmlCodeSniffer(page, opts, function () {
			assert.isTrue(global.window.HTMLCS.process.withArgs(opts.standard, global.window.document).calledOnce);
			assert.isTrue(global.window.__pa11y.isComplete);
			done();
		});
	});

	it('should callback with the resulting HTML CodeSniffer messages', function (done) {
		runHtmlCodeSniffer(page, opts, function (err, results) {
			assert.strictEqual(results, messages);
			done();
		});
	});

});

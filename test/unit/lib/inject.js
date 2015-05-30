/* jshint maxstatements: false */
/* global beforeEach, describe, it */
// jscs:disable disallowMultipleVarDecl, maximumLineLength
'use strict';

var assert = require('proclaim');

describe('lib/inject', function () {
	var inject, options, window;

	beforeEach(function () {
		window = require('../mock/window');
		options = {
			ignore: [],
			standard: 'FOO-STANDARD'
		};
		inject = require('../../../lib/inject');
	});

	it('should be a function', function () {
		assert.isFunction(inject);
	});

	it('should process the page with HTML CodeSniffer', function (done) {
		inject(window, options, function () {
			assert.calledOnce(window.HTMLCS.process);
			assert.calledWith(window.HTMLCS.process, 'FOO-STANDARD', window.document);
			done();
		});
	});

	it('should get the HTML CodeSniffer messages after processing the page', function (done) {
		inject(window, options, function () {
			assert.calledOnce(window.HTMLCS.getMessages);
			assert.callOrder(
				window.HTMLCS.process,
				window.HTMLCS.getMessages
			);
			done();
		});
	});

	it('should callback with the messages reformatted for pa11y', function (done) {
		window.HTMLCS.getMessages.returns([
			{
				code: 'foo-code',
				element: {
					innerHTML: 'foo inner',
					outerHTML: '<element>foo inner</element>'
				},
				msg: 'foo message',
				type: 1
			},
			{
				code: 'bar-code',
				element: {
					innerHTML: 'bar inner at more than 30 characters long',
					outerHTML: '<element>bar inner at more than 30 characters long</element>'
				},
				msg: 'bar message',
				type: 2
			},
			{
				code: 'baz-code',
				element: {
					innerHTML: 'baz inner',
					outerHTML: '<element with="loads of attributes" that="push the total outerHTML length" to="more than we really want to send back to Node.js" this="is getting kind of silly now, I really want to stop writing dummy text to push the length of this element out">baz inner</element>'
				},
				msg: 'baz message',
				type: 3
			}
		]);
		inject(window, options, function (result) {
			assert.isDefined(result.messages);
			assert.deepEqual(result.messages, [
				{
					code: 'foo-code',
					context: '<element>foo inner</element>',
					message: 'foo message',
					type: 'error',
					typeCode: 1
				},
				{
					code: 'bar-code',
					context: '<element>bar inner at more than 30 chara...</element>',
					message: 'bar message',
					type: 'warning',
					typeCode: 2
				},
				{
					code: 'baz-code',
					context: '<element with=\"loads of attributes\" that=\"push the total outerHTML length\" to=\"more than we really want to send back to Node.js\" this=\"is getting kind of silly now, I really want to stop writing dummy text to push the length of this element out\">baz ...',
					message: 'baz message',
					type: 'notice',
					typeCode: 3
				}
			]);
			done();
		});
	});

	it('should ignore messages when their code appears in `options.ignore`', function (done) {
		options.ignore.push('foo-code');
		window.HTMLCS.getMessages.returns([
			{
				code: 'Foo-Code',
				element: {
					innerHTML: 'foo inner',
					outerHTML: '<element>foo inner</element>'
				},
				msg: 'foo message',
				type: 1
			},
			{
				code: 'bar-code',
				element: {
					innerHTML: 'bar inner at more than 30 characters long',
					outerHTML: '<element>bar inner at more than 30 characters long</element>'
				},
				msg: 'bar message',
				type: 2
			}
		]);
		inject(window, options, function (result) {
			assert.isDefined(result.messages);
			assert.deepEqual(result.messages, [
				{
					code: 'bar-code',
					context: '<element>bar inner at more than 30 chara...</element>',
					message: 'bar message',
					type: 'warning',
					typeCode: 2
				}
			]);
			done();
		});
	});

	it('should ignore messages when their type appears in `options.ignore`', function (done) {
		options.ignore.push('warning');
		window.HTMLCS.getMessages.returns([
			{
				code: 'foo-code',
				element: {
					innerHTML: 'foo inner',
					outerHTML: '<element>foo inner</element>'
				},
				msg: 'foo message',
				type: 1
			},
			{
				code: 'bar-code',
				element: {
					innerHTML: 'bar inner at more than 30 characters long',
					outerHTML: '<element>bar inner at more than 30 characters long</element>'
				},
				msg: 'bar message',
				type: 2
			}
		]);
		inject(window, options, function (result) {
			assert.isDefined(result.messages);
			assert.deepEqual(result.messages, [
				{
					code: 'foo-code',
					context: '<element>foo inner</element>',
					message: 'foo message',
					type: 'error',
					typeCode: 1
				}
			]);
			done();
		});
	});

	it('should callback with an error message if HTML CodeSniffer throws', function (done) {
		window.HTMLCS.process.throws(new Error('Oopsie'));
		inject(window, options, function (result) {
			assert.isDefined(result.error);
			assert.strictEqual(result.error, 'HTML CodeSniffer: Oopsie');
			done();
		});
	});

});

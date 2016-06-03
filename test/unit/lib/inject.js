// jshint maxstatements: false
// jscs:disable disallowMultipleVarDecl, maximumLineLength
'use strict';

var assert = require('proclaim');

describe('lib/inject', function() {
	var inject, options, window;

	beforeEach(function() {
		window = require('../mock/window');
		options = {
			ignore: [],
			rootElement: null,
			standard: 'FOO-STANDARD',
			wait: 0
		};
		inject = require('../../../lib/inject');
	});

	it('should be a function', function() {
		assert.isFunction(inject);
	});

	it('should process the page with HTML CodeSniffer', function(done) {
		inject(window, options, function() {
			assert.calledOnce(window.HTMLCS.process);
			assert.calledWith(window.HTMLCS.process, 'FOO-STANDARD', window.document);
			done();
		});
	});

	it('should ignore messages when they are a child of `options.hideElements`', function(done) {
		options.hideElements = '.hide';
		window.document.querySelectorAll.returns([
			{
				outerHTML: '<element class="hide">parent</element>'
			}
		]);
		window.HTMLCS.getMessages.returns([
			{
				code: 'foo-code',
				element: {
					parentNode: null,
					isEqualNode: function() {
						return false;
					},
					innerHTML: 'outside hideElements',
					outerHTML: '<element>outside hideElements</element>'
				},
				msg: 'foo message',
				type: 1
			},
			{
				code: 'foo-code',
				element: {
					parentNode: {
						isEqualNode: function() {
							return true;
						}
					},
					isEqualNode: function() {
						return false;
					},
					innerHTML: 'inside hideElements',
					outerHTML: '<element>inside hideElements</element>'
				},
				msg: 'foo message',
				type: 1
			}
		]);
		inject(window, options, function(result) {
			assert.isDefined(result.messages);
			assert.deepEqual(result.messages, [
				{
					code: 'foo-code',
					context: '<element>outside hideElements</element>',
					message: 'foo message',
					selector: '',
					type: 'error',
					typeCode: 1
				}
			]);
			done();
		});
	});

	it('should ignore messages when the element is in `options.hideElements`', function(done) {
		options.hideElements = '#hide,.hidden';
		window.document.querySelectorAll.returns([
			{
				parentNode: null,
				innerHTML: 'Is a hidden Element',
				outerHTML: '<element class="hidden">Is a hidden Element</element>'
			},
			{
				parentNode: null,
				innerHTML: 'Is a hidden Element',
				outerHTML: '<element id="hide">Is a hidden Element</element>'
			}
		]);
		window.HTMLCS.getMessages.returns([
			{
				code: 'foo-code',
				element: {
					parentNode: null,
					isEqualNode: function() {
						return true;
					},
					innerHTML: 'Is a hidden Element',
					outerHTML: '<element class="hidden">Is a hidden Element</element>'
				},
				msg: 'foo message',
				type: 1
			},
			{
				code: 'foo-code',
				element: {
					parentNode: null,
					isEqualNode: function() {
						return true;
					},
					innerHTML: 'Is a hidden Element',
					outerHTML: '<element id="hide">Is a hidden Element</element>'
				},
				msg: 'foo message',
				type: 1
			},
			{
				code: 'foo-code',
				element: {
					parentNode: null,
					isEqualNode: function() {
						return false;
					},
					innerHTML: 'Is a NOT hidden Element',
					outerHTML: '<element>Is NOT a hidden Element</element>'
				},
				msg: 'foo message',
				type: 1
			}
		]);
		inject(window, options, function(result) {
			assert.isDefined(result.messages);
			assert.deepEqual(result.messages, [
				{
					code: 'foo-code',
					context: '<element>Is NOT a hidden Element</element>',
					message: 'foo message',
					selector: '',
					type: 'error',
					typeCode: 1
				}
			]);
			done();
		});
	});

	it('should wait before processing the page if `options.wait` is set', function(done) {
		// Note: this test isn't particularly reliable, revisit some time
		var start = Date.now();
		options.wait = 10;
		inject(window, options, function() {
			var end = Date.now() - start;
			assert.greaterThanOrEqual(end, 10);
			done();
		});
	});

	it('should get the HTML CodeSniffer messages after processing the page', function(done) {
		inject(window, options, function() {
			assert.calledOnce(window.HTMLCS.getMessages);
			assert.callOrder(
				window.HTMLCS.process,
				window.HTMLCS.getMessages
			);
			done();
		});
	});

	it('should callback with the messages reformatted for pa11y', function(done) {
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
		inject(window, options, function(result) {
			assert.isDefined(result.messages);
			assert.deepEqual(result.messages, [
				{
					code: 'foo-code',
					context: '<element>foo inner</element>',
					message: 'foo message',
					selector: '',
					type: 'error',
					typeCode: 1
				},
				{
					code: 'bar-code',
					context: '<element>bar inner at more than 30 chara...</element>',
					message: 'bar message',
					selector: '',
					type: 'warning',
					typeCode: 2
				},
				{
					code: 'baz-code',
					context: '<element with=\"loads of attributes\" that=\"push the total outerHTML length\" to=\"more than we really want to send back to Node.js\" this=\"is getting kind of silly now, I really want to stop writing dummy text to push the length of this element out\">baz ...',
					message: 'baz message',
					selector: '',
					type: 'notice',
					typeCode: 3
				}
			]);
			done();
		});
	});

	it('should ignore messages when their code appears in `options.ignore`', function(done) {
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
		inject(window, options, function(result) {
			assert.isDefined(result.messages);
			assert.deepEqual(result.messages, [
				{
					code: 'bar-code',
					context: '<element>bar inner at more than 30 chara...</element>',
					message: 'bar message',
					selector: '',
					type: 'warning',
					typeCode: 2
				}
			]);
			done();
		});
	});

	it('should ignore messages when their type appears in `options.ignore`', function(done) {
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
		inject(window, options, function(result) {
			assert.isDefined(result.messages);
			assert.deepEqual(result.messages, [
				{
					code: 'foo-code',
					context: '<element>foo inner</element>',
					message: 'foo message',
					selector: '',
					type: 'error',
					typeCode: 1
				}
			]);
			done();
		});
	});

	it('should ignore messages when they are NOT a child of `options.rootElement`', function(done) {
		options.rootElement = '[data-test=true]';
		window.document.querySelector.returns('<element data-test="true">parent</element>');
		window.HTMLCS.getMessages.returns([
			{
				code: 'foo-code',
				element: {
					parentNode: null,
					innerHTML: 'outside rootElement',
					outerHTML: '<element>outside rootElement</element>'
				},
				msg: 'foo message',
				type: 1
			},
			{
				code: 'foo-code',
				element: {
					parentNode: '<element data-test="true">parent</element>',
					innerHTML: 'inside rootElement',
					outerHTML: '<element>inside rootElement</element>'
				},
				msg: 'foo message',
				type: 1
			}
		]);
		inject(window, options, function(result) {
			assert.isDefined(result.messages);
			assert.deepEqual(result.messages, [
				{
					code: 'foo-code',
					context: '<element>inside rootElement</element>',
					message: 'foo message',
					selector: '',
					type: 'error',
					typeCode: 1
				}
			]);
			done();
		});
	});

	it('should handle malformed messages and elements', function(done) {
		window.HTMLCS.getMessages.returns([
			{
				code: 'foo-code',
				element: {},
				msg: 'foo message',
				type: 4
			}
		]);
		inject(window, options, function(result) {
			assert.isDefined(result.messages);
			assert.deepEqual(result.messages, [
				{
					code: 'foo-code',
					context: null,
					message: 'foo message',
					selector: '',
					type: 'unknown',
					typeCode: 4
				}
			]);
			done();
		});
	});

	it('should generate CSS selectors for elements with IDs', function(done) {
		var element = {
			id: 'foo',
			nodeType: 1
		};
		window.HTMLCS.getMessages.returns([
			{
				code: 'foo-code',
				element: element,
				msg: 'foo message',
				type: 1
			}
		]);
		inject(window, options, function(result) {
			assert.isDefined(result.messages);
			assert.lengthEquals(result.messages, 1);
			assert.strictEqual(result.messages[0].selector, '#foo');
			done();
		});
	});

	it('should generate CSS selectors for elements with IDs', function(done) {
		var element = {
			id: 'foo',
			nodeType: 1
		};
		window.HTMLCS.getMessages.returns([
			{
				code: 'code',
				element: element,
				msg: 'message',
				type: 1
			}
		]);
		inject(window, options, function(result) {
			assert.isDefined(result.messages);
			assert.lengthEquals(result.messages, 1);
			assert.strictEqual(result.messages[0].selector, '#foo');
			done();
		});
	});

	it('should generate CSS selectors for elements whose parents have IDs and are unique children', function(done) {
		var element = {
			nodeType: 1,
			tagName: 'BAR',
			parentNode: {
				id: 'foo',
				nodeType: 1
			}
		};
		element.parentNode.childNodes = [
			{
				nodeType: 1,
				tagName: 'BAZ'
			},
			element,
			{
				nodeType: 1,
				tagName: 'BAZ'
			}
		];
		window.HTMLCS.getMessages.returns([
			{
				code: 'code',
				element: element,
				msg: 'message',
				type: 1
			}
		]);
		inject(window, options, function(result) {
			assert.isDefined(result.messages);
			assert.lengthEquals(result.messages, 1);
			assert.strictEqual(result.messages[0].selector, '#foo > bar');
			done();
		});
	});

	it('should generate CSS selectors for elements whose parents have IDs and are not unique children', function(done) {
		var element = {
			nodeType: 1,
			tagName: 'BAR',
			parentNode: {
				id: 'foo',
				nodeType: 1
			}
		};
		element.parentNode.childNodes = [
			{
				nodeType: 1,
				tagName: 'BAR'
			},
			element,
			{
				nodeType: 1,
				tagName: 'BAR'
			}
		];
		window.HTMLCS.getMessages.returns([
			{
				code: 'code',
				element: element,
				msg: 'message',
				type: 1
			}
		]);
		inject(window, options, function(result) {
			assert.isDefined(result.messages);
			assert.lengthEquals(result.messages, 1);
			assert.strictEqual(result.messages[0].selector, '#foo > bar:nth-child(2)');
			done();
		});
	});

	it('should generate CSS selectors for elements whose parents have no IDs', function(done) {
		var element = {
			nodeType: 1,
			tagName: 'BAR',
			parentNode: {
				nodeType: 1,
				tagName: 'FOO'
			}
		};
		element.parentNode.childNodes = [
			element
		];
		window.HTMLCS.getMessages.returns([
			{
				code: 'code',
				element: element,
				msg: 'message',
				type: 1
			}
		]);
		inject(window, options, function(result) {
			assert.isDefined(result.messages);
			assert.lengthEquals(result.messages, 1);
			assert.strictEqual(result.messages[0].selector, 'foo > bar');
			done();
		});
	});

	it('should callback with an error message if HTML CodeSniffer throws', function(done) {
		window.HTMLCS.process.throws(new Error('Oopsie'));
		inject(window, options, function(result) {
			assert.isDefined(result.error);
			assert.strictEqual(result.error, 'HTML CodeSniffer: Oopsie');
			done();
		});
	});

});

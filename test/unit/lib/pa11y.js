'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var path = require('path');
var sinon = require('sinon');

describe('lib/pa11y', function() {
	var buildAction;
	var extend;
	var injectScriptPath;
	var pa11y;
	var phantom;
	var pkg;
	var truffler;
	var trufflerPkg;
	var window;

	beforeEach(function() {

		buildAction = sinon.stub().returns(sinon.stub().yieldsAsync());
		buildAction.isValidAction = sinon.stub();
		mockery.registerMock('./action', buildAction);

		extend = sinon.spy(require('node.extend'));
		mockery.registerMock('node.extend', extend);

		injectScriptPath = path.resolve(__dirname, '..', '..', '..', 'lib', 'inject.js');

		phantom = require('../mock/phantom');
		mockery.registerMock('phantom', phantom);

		pkg = require('../../../package.json');
		trufflerPkg = require('truffler/package.json');

		truffler = require('../mock/truffler');
		mockery.registerMock('truffler', truffler);

		window = require('../mock/window');

		pa11y = require('../../../lib/pa11y');

	});

	it('should be a function', function() {
		assert.isFunction(pa11y);
	});

	it('should have a `defaults` property', function() {
		assert.isObject(pa11y.defaults);
	});

	describe('.defaults', function() {
		var defaults;

		beforeEach(function() {
			defaults = pa11y.defaults;
		});

		it('should have an `actions` property', function() {
			assert.deepEqual(defaults.actions, []);
		});

		it('should have a `beforeScript` property', function() {
			assert.strictEqual(defaults.beforeScript, null);
		});

		it('should have an `htmlcs` property', function() {
			assert.strictEqual(defaults.htmlcs, path.resolve(path.join(__dirname, '/../../..')) + '/lib/vendor/HTMLCS.js');
		});

		it('should have an `ignore` property', function() {
			assert.deepEqual(defaults.ignore, []);
		});

		it('should have a `rules` property', function() {
			assert.deepEqual(defaults.rules, []);
		});

		it('should have a `log` property', function() {
			assert.isObject(defaults.log);
		});

		it('should have a `log.debug` method', function() {
			assert.isFunction(defaults.log.debug);
		});

		it('should have a `log.error` method', function() {
			assert.isFunction(defaults.log.error);
		});

		it('should have a `log.info` method', function() {
			assert.isFunction(defaults.log.info);
		});

		it('should have a `page` property', function() {
			assert.isObject(defaults.page);
		});

		it('should have a `page.settings` property', function() {
			assert.isObject(defaults.page.settings);
		});

		it('should have a `page.settings.userAgent` property', function() {
			assert.strictEqual(defaults.page.settings.userAgent, 'pa11y/' + pkg.version + ' (truffler/' + trufflerPkg.version + ')');
		});

		it('should have a `phantom` property', function() {
			assert.isObject(defaults.phantom);
		});

		it('should have a `phantom.onStdout` method', function() {
			assert.isFunction(defaults.phantom.onStdout);
		});

		it('should have a `phantom.parameters` property', function() {
			assert.isObject(defaults.phantom.parameters);
		});

		it('should have a `phantom.parameters[\'ignore-ssl-errors\']` property', function() {
			assert.strictEqual(defaults.phantom.parameters['ignore-ssl-errors'], 'true');
		});

		it('should have a `screenCapture` property', function() {
			assert.strictEqual(defaults.screenCapture, null);
		});

		it('should have a `standard` property', function() {
			assert.strictEqual(defaults.standard, 'WCAG2AA');
		});

		it('should have a `wait` property', function() {
			assert.strictEqual(defaults.wait, 0);
		});

	});

	describe('.pa11y(options)', function() {
		var instance;
		var options;

		beforeEach(function() {
			options = {
				foo: 'bar'
			};
			instance = pa11y(options);
		});

		it('should default the options', function() {
			assert.calledOnce(extend);
			assert.isTrue(extend.firstCall.args[0]);
			assert.isObject(extend.firstCall.args[1]);
			assert.strictEqual(extend.firstCall.args[2], pa11y.defaults);
			assert.strictEqual(extend.firstCall.args[3], options);
		});

		it('should lower-case all of the ignored codes and types', function() {
			options.ignore = [
				'FOO',
				'Bar',
				'baz'
			];
			extend.reset();
			pa11y(options);
			assert.deepEqual(extend.firstCall.returnValue.ignore, [
				'foo',
				'bar',
				'baz'
			]);
		});

		it('should create a Truffler instance with the defaulted options', function() {
			assert.calledOnce(truffler);
			assert.strictEqual(truffler.firstCall.args[0], extend.firstCall.returnValue);
		});

		it('should pass a test function into Truffler', function() {
			assert.isFunction(truffler.firstCall.args[1]);
		});

		it('should return the Truffler instance', function() {
			assert.isObject(instance);
			assert.strictEqual(instance, truffler.mockReturn);
		});

		it('should throw an error if `options.standard` is invalid', function() {
			options.standard = 'foo';
			assert.throws(function() {
				pa11y(options);
			}, 'Standard must be one of Section508, WCAG2A, WCAG2AA, WCAG2AAA');
		});

	});

	describe('Truffler test function', function() {
		var expectedResults;
		var options;
		var runResults;
		var testFunction;

		beforeEach(function(done) {
			options = {
				ignore: [
					'BAZ',
					'qux'
				],
				standard: 'Section508',
				wait: 0,
				rootElement: null
			};
			pa11y(options);

			expectedResults = {
				messages: [
					'foo',
					'bar'
				]
			};
			phantom.mockPage.evaluate = sinon.spy(function() {
				phantom.mockPage.onCallback(expectedResults);
			});

			testFunction = truffler.firstCall.args[1];
			testFunction(phantom.mockBrowser, phantom.mockPage, extend.firstCall.returnValue, function(error, results) {
				runResults = results;
				done(error);
			});
		});

		it('should create a page callback on the PhantomJS page', function() {
			assert.isFunction(phantom.mockPage.onCallback);
		});

		it('should call the `beforeScript` function if specified in `options.beforeScript`', function(done) {
			options = {
				beforeScript: sinon.stub().yieldsAsync()
			};

			truffler.reset();
			pa11y(options);
			testFunction = truffler.firstCall.args[1];
			testFunction(phantom.mockBrowser, phantom.mockPage, extend.secondCall.returnValue, function() {
				assert.calledOnce(options.beforeScript);
				assert.strictEqual(options.beforeScript.firstCall.args[0], phantom.mockPage);
				assert.strictEqual(options.beforeScript.firstCall.args[1], extend.secondCall.returnValue);
				assert.isFunction(options.beforeScript.firstCall.args[2]);
				done();
			});
		});

		it('should not call the `beforeScript` function if `options.action` is set', function(done) {
			options = {
				actions: [
					'foo'
				],
				beforeScript: sinon.stub().yieldsAsync(),
				log: {
					debug: sinon.spy(),
					info: sinon.spy()
				}
			};

			truffler.reset();
			pa11y(options);
			testFunction = truffler.firstCall.args[1];
			testFunction(phantom.mockBrowser, phantom.mockPage, extend.secondCall.returnValue, function() {
				assert.notCalled(options.beforeScript);
				assert.neverCalledWith(options.log.debug, 'Running beforeScript');
				assert.calledWith(options.log.info, 'beforeScript cannot be used in combination with actions, ignoring beforeScript');
				done();
			});
		});

		it('should log that a script is running before testing starts if configured to', function(done) {
			options = {
				beforeScript: sinon.stub().yieldsAsync(),
				log: {
					debug: sinon.spy()
				}
			};
			truffler.reset();
			pa11y(options);
			testFunction = truffler.firstCall.args[1];
			testFunction(phantom.mockBrowser, phantom.mockPage, extend.secondCall.returnValue, function() {
				assert.calledWith(options.log.debug, 'Running beforeScript');
				done();
			});
		});

		it('should build action functions if `options.action` is set, and call each of them in series', function(done) {
			options = {
				actions: [
					'foo',
					'bar'
				],
				log: {
					info: sinon.spy()
				}
			};

			truffler.reset();
			pa11y(options);

			var builtAction1 = sinon.stub().yieldsAsync();
			var builtAction2 = sinon.stub().yieldsAsync();
			buildAction.withArgs(phantom.mockBrowser, phantom.mockPage, extend.secondCall.returnValue, 'foo').returns(builtAction1);
			buildAction.withArgs(phantom.mockBrowser, phantom.mockPage, extend.secondCall.returnValue, 'bar').returns(builtAction2);

			testFunction = truffler.firstCall.args[1];
			testFunction(phantom.mockBrowser, phantom.mockPage, extend.secondCall.returnValue, function() {
				assert.calledWith(options.log.info, 'Running actions');
				assert.calledTwice(buildAction);
				assert.calledWithExactly(buildAction.firstCall, phantom.mockBrowser, phantom.mockPage, extend.secondCall.returnValue, 'foo');
				assert.calledWithExactly(buildAction.secondCall, phantom.mockBrowser, phantom.mockPage, extend.secondCall.returnValue, 'bar');
				assert.calledOnce(builtAction1);
				assert.calledOnce(builtAction2);
				assert.calledWith(options.log.info, 'Finished running actions');
				done();
			});
		});

		it('should callback with an error if an action errors', function(done) {
			options = {
				actions: [
					'foo'
				],
				log: {
					info: sinon.spy()
				}
			};

			truffler.reset();
			pa11y(options);

			var expectedError = new Error('...');
			var builtAction = sinon.stub().yieldsAsync(expectedError);
			buildAction.returns(builtAction);

			testFunction = truffler.firstCall.args[1];
			testFunction(phantom.mockBrowser, phantom.mockPage, extend.secondCall.returnValue, function(error) {
				assert.isNotNull(error);
				assert.strictEqual(error, expectedError);
				assert.neverCalledWith(options.log.info, 'Finished running actions');
				done();
			});
		});

		it('should inject HTML CodeSniffer', function() {
			var inject = phantom.mockPage.injectJs.withArgs(pa11y.defaults.htmlcs);
			assert.calledOnce(inject);
			assert.isFunction(inject.firstCall.args[1]);
			assert.notCalled(phantom.mockPage.includeJs);
		});

		it('should callback with an error if HTML CodeSniffer injection errors', function(done) {
			var expectedError = new Error('...');
			phantom.mockPage.injectJs.withArgs(pa11y.defaults.htmlcs).yieldsAsync(expectedError);
			testFunction(phantom.mockBrowser, phantom.mockPage, extend.firstCall.returnValue, function(error) {
				assert.isNotNull(error);
				assert.strictEqual(error, expectedError);
				done();
			});
		});

		it('should callback with an error if HTML CodeSniffer does not inject properly', function(done) {
			phantom.mockPage.injectJs.withArgs(pa11y.defaults.htmlcs).yieldsAsync(null, false);
			testFunction(phantom.mockBrowser, phantom.mockPage, extend.firstCall.returnValue, function(error) {
				assert.isNotNull(error);
				assert.strictEqual(error.message, 'Pa11y was unable to inject scripts into the page');
				done();
			});
		});

		describe('when a remote HTML CodeSniffer is specified', function() {

			beforeEach(function(done) {
				options = {
					htmlcs: 'http://foo.com/HTMLCS.js'
				};
				truffler.reset();
				phantom.mockPage.injectJs.resetHistory();
				pa11y(options);
				testFunction = truffler.firstCall.args[1];
				testFunction(phantom.mockBrowser, phantom.mockPage, extend.secondCall.returnValue, done);
			});

			it('should include the remote HTML CodeSniffer', function() {
				var include = phantom.mockPage.includeJs.withArgs(options.htmlcs);
				assert.calledOnce(include);
				assert.isFunction(include.firstCall.args[1]);
				assert.notCalled(phantom.mockPage.injectJs.withArgs(pa11y.defaults.htmlcs));
			});

			it('should callback with an error if HTML CodeSniffer inclusion errors', function(done) {
				var expectedError = new Error('...');
				phantom.mockPage.includeJs.withArgs(options.htmlcs).yieldsAsync(expectedError);
				testFunction(phantom.mockBrowser, phantom.mockPage, extend.secondCall.returnValue, function(error) {
					assert.isNotNull(error);
					assert.strictEqual(error, expectedError);
					done();
				});
			});

			it('should callback with an error if HTML CodeSniffer does not include properly', function(done) {
				phantom.mockPage.includeJs.withArgs(options.htmlcs).yieldsAsync(null, false);
				testFunction(phantom.mockBrowser, phantom.mockPage, extend.secondCall.returnValue, function(error) {
					assert.isNotNull(error);
					assert.strictEqual(error.message, 'Pa11y was unable to include scripts in the page');
					done();
				});
			});

		});

		it('should inject the pa11y inject script', function() {
			var inject = phantom.mockPage.injectJs.withArgs(injectScriptPath);
			assert.calledOnce(inject);
			assert.isFunction(inject.firstCall.args[1]);
		});

		it('should callback with an error if the pa11y inject script injection errors', function(done) {
			var expectedError = new Error('...');
			phantom.mockPage.injectJs.withArgs(injectScriptPath).yieldsAsync(expectedError);
			testFunction(phantom.mockBrowser, phantom.mockPage, extend.firstCall.returnValue, function(error) {
				assert.isNotNull(error);
				assert.strictEqual(error, expectedError);
				done();
			});
		});

		it('should callback with an error if the pa11y inject script does not inject properly', function(done) {
			phantom.mockPage.injectJs.withArgs(injectScriptPath).yieldsAsync(null, false);
			testFunction(phantom.mockBrowser, phantom.mockPage, extend.firstCall.returnValue, function(error) {
				assert.isNotNull(error);
				assert.strictEqual(error.message, 'Pa11y was unable to inject scripts into the page');
				done();
			});
		});

		it('should evaluate a JavaScript function with passed in options', function() {
			assert.calledOnce(phantom.mockPage.evaluate);
			assert.isFunction(phantom.mockPage.evaluate.firstCall.args[0]);
			assert.deepEqual(phantom.mockPage.evaluate.firstCall.args[1], {
				hideElements: null,
				ignore: [
					'baz',
					'qux'
				],
				standard: 'Section508',
				wait: 0,
				verifyPage: null,
				rootElement: null,
				rules: []
			});
			assert.isFunction(phantom.mockPage.evaluate.firstCall.args[2]);
		});

		describe('evaluated function()', function() {
			var evaluatedFunction;
			var returnValue;

			beforeEach(function() {
				global.window = window;
				global.injectPa11y = sinon.spy();
				evaluatedFunction = phantom.mockPage.evaluate.firstCall.args[0];
				returnValue = evaluatedFunction(options);
			});

			afterEach(function() {
				delete global.window;
				delete global.injectPa11y;
			});

			it('should call the `injectPa11y` global function with the expected arguments', function() {
				assert.calledOnce(global.injectPa11y);
				assert.calledWithExactly(global.injectPa11y, global.window, options, global.window.callPhantom);
			});

			it('should return nothing', function() {
				assert.isUndefined(returnValue);
			});

			it('should return an error-like structure if `window.callPhantom` is not a function', function() {
				global.injectPa11y.reset();
				delete global.window.callPhantom;
				returnValue = evaluatedFunction(options);
				assert.deepEqual(returnValue, {
					error: 'Pa11y could not report back to PhantomJS'
				});
			});

		});

		it('should log that the run is about to wait if configured to', function(done) {
			options = {
				wait: 500,
				log: {
					debug: sinon.spy()
				}
			};
			truffler.reset();
			pa11y(options);
			testFunction = truffler.firstCall.args[1];
			testFunction(phantom.mockBrowser, phantom.mockPage, extend.secondCall.returnValue, function() {
				assert.calledWith(options.log.debug, 'Waiting for ' + options.wait + 'ms');
				done();
			});
		});

		it('should create a screen capture if one is requested', function(done) {
			options = {
				screenCapture: 'foo.png',
				log: {
					info: sinon.spy()
				}
			};
			truffler.reset();
			pa11y(options);
			testFunction = truffler.firstCall.args[1];
			testFunction(phantom.mockBrowser, phantom.mockPage, extend.secondCall.returnValue, function() {
				assert.calledWith(options.log.info, 'Capturing screen, saving to "' + options.screenCapture + '"');
				assert.calledOnce(phantom.mockPage.render);
				assert.calledWith(phantom.mockPage.render, options.screenCapture);
				done();
			});
		});

		it('should log an error if the screen capture errors', function(done) {
			var screenCaptureError = new Error('screen-capture-error');
			options = {
				screenCapture: 'foo.png',
				log: {
					error: sinon.spy(),
					info: sinon.spy()
				}
			};
			truffler.reset();
			phantom.mockPage.render.reset();
			phantom.mockPage.render.yieldsAsync(screenCaptureError);
			pa11y(options);
			testFunction = truffler.firstCall.args[1];
			testFunction(phantom.mockBrowser, phantom.mockPage, extend.secondCall.returnValue, function() {
				assert.calledOnce(phantom.mockPage.render);
				assert.calledWith(phantom.mockPage.render, options.screenCapture);
				assert.calledWith(options.log.error, 'Error capturing screen: ' + screenCaptureError.message);
				done();
			});
		});

		it('should callback with the expected results', function() {
			assert.strictEqual(runResults, expectedResults.messages);
		});

		it('should callback with an error if the evaluated script errors', function(done) {
			expectedResults = {
				error: 'foo'
			};
			phantom.mockPage.evaluate = sinon.spy(function() {
				phantom.mockPage.onCallback(expectedResults);
			});
			testFunction(phantom.mockBrowser, phantom.mockPage, extend.firstCall.returnValue, function(error) {
				assert.isNotNull(error);
				assert.instanceOf(error, Error);
				assert.strictEqual(error.message, 'foo');
				done();
			});
		});

	});

	describe('testPage function', function() {
		var expectedResults;
		var options;
		var testFunction;

		beforeEach(function(done) {
			options = {
				log: {
					debug: sinon.spy()
				}
			};
			pa11y(options);

			expectedResults = {
				documentTitle: 'quux'
			};
			phantom.mockPage.evaluate = sinon.spy(function() {
				phantom.mockPage.onCallback(expectedResults);
			});

			testFunction = truffler.firstCall.args[1];
			done();
		});

		it('should call debug log with document title', function(done) {
			testFunction(phantom.mockBrowser, phantom.mockPage, extend.firstCall.returnValue, function() {
				assert.calledWith(options.log.debug, 'Document title: "quux"');
				done();
			});
		});

	});

	it('should have a `validateAction` method which aliases actions.isValidAction', function() {
		assert.isFunction(pa11y.validateAction);
		assert.strictEqual(pa11y.validateAction, buildAction.isValidAction);
	});

});

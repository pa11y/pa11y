'use strict';

var assert = require('proclaim');
var sinon = require('sinon');

describe('lib/action', function() {
	var buildAction;

	beforeEach(function() {
		buildAction = require('../../../lib/action');
	});

	it('should be a function', function() {
		assert.isFunction(buildAction);
	});

	it('has an `allowedActions` property', function() {
		assert.isArray(buildAction.allowedActions);
	});

	it('has an `isValidAction` method', function() {
		assert.isFunction(buildAction.isValidAction);
	});

	describe('buildAction(browser, page, options, actionString)', function() {
		var browser;
		var mockActionRunner1;
		var mockActionRunner2;
		var options;
		var page;
		var returnedValue;

		beforeEach(function() {
			browser = {
				isMockBrowser: true
			};
			options = {
				log: {
					debug: sinon.spy()
				}
			};
			page = {
				isMockPage: true
			};
			mockActionRunner1 = sinon.stub().yieldsAsync();
			mockActionRunner2 = sinon.stub().yieldsAsync();
			buildAction.allowedActions = [
				{
					match: /^foo/,
					build: sinon.stub().returns(mockActionRunner1)
				},
				{
					match: /^bar/,
					build: sinon.stub().returns(mockActionRunner2)
				}
			];
			returnedValue = buildAction(browser, page, options, 'bar 123');
		});

		it('calls the build function that matches the given `actionString`', function() {
			var action = buildAction.allowedActions[1];
			assert.notCalled(buildAction.allowedActions[0].build);
			assert.calledOnce(action.build);
			assert.calledWith(action.build, browser, page, options);
			assert.deepEqual(action.build.firstCall.args[3], [
				'bar'
			]);
		});

		it('returns a function', function() {
			assert.isFunction(returnedValue);
		});

		describe('returned function', function() {

			beforeEach(function(done) {
				returnedValue(done);
			});

			it('logs that the action is running', function() {
				assert.calledWith(options.log.debug, 'Running action: bar 123');
			});

			it('calls the built action runner', function() {
				assert.calledOnce(mockActionRunner2);
			});

			it('logs that the action is complete', function() {
				assert.calledWith(options.log.debug, '  ✔︎ action complete');
			});

		});

		describe('when `actionString` does not match an allowed action', function() {

			beforeEach(function() {
				options.log.debug.reset();
				mockActionRunner2.reset();
				buildAction.allowedActions[1].build.reset();
				returnedValue = buildAction(browser, page, options, 'baz 123');
			});

			describe('returned function', function() {
				var caughtError;

				beforeEach(function(done) {
					returnedValue(function(error) {
						caughtError = error;
						done();
					});
				});

				it('calls back with an error detailing the unresolved action', function() {
					assert.instanceOf(caughtError, Error);
					assert.strictEqual(caughtError.message, 'Failed action: "baz 123" cannot be resolved');
				});

				it('does not log that the action is running', function() {
					assert.neverCalledWith(options.log.debug, 'Running action: baz 123');
				});

				it('does not call the built action runner', function() {
					assert.notCalled(mockActionRunner2);
				});

				it('does not log that the action is complete', function() {
					assert.neverCalledWith(options.log.debug, '  ✔︎ action complete');
				});

			});

		});

		describe('when the action runner calls back with an error', function() {
			var actionRunnerError;

			beforeEach(function() {
				options.log.debug.reset();
				mockActionRunner2.reset();
				actionRunnerError = new Error('action-runner-error');
				mockActionRunner2.yieldsAsync(actionRunnerError);
				returnedValue = buildAction(browser, page, options, 'bar 123');
			});

			describe('returned function', function() {
				var caughtError;

				beforeEach(function(done) {
					returnedValue(function(error) {
						caughtError = error;
						done();
					});
				});

				it('logs that the action is running', function() {
					assert.calledWith(options.log.debug, 'Running action: bar 123');
				});

				it('calls the built action runner', function() {
					assert.calledOnce(mockActionRunner2);
				});

				it('calls back with the action runner\'s error', function() {
					assert.strictEqual(caughtError, actionRunnerError);
				});

				it('does not log that the action is complete', function() {
					assert.neverCalledWith(options.log.debug, '  ✔︎ action complete');
				});

			});

		});

	});

	describe('.isValidAction(actionString)', function() {

		beforeEach(function() {
			buildAction.allowedActions = [
				{
					match: /foo/i
				}
			];
		});

		it('should return `true` when the actionString matches one of the allowed actions', function() {
			assert.isTrue(buildAction.isValidAction('hello foo!'));
		});

		it('should return `false` when the actionString does not match any of the allowed actions', function() {
			assert.isFalse(buildAction.isValidAction('hello bar!'));
		});

	});

	describe('click-element action', function() {
		var action;

		beforeEach(function() {
			action = buildAction.allowedActions.find(function(allowedAction) {
				return allowedAction.name === 'click-element';
			});
		});

		it('should have a name property', function() {
			assert.strictEqual(action.name, 'click-element');
		});

		it('should have a match property', function() {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', function() {

			it('should match all of the expected action strings', function() {
				assert.deepEqual('click .foo'.match(action.match), [
					'click .foo',
					undefined,
					'.foo'
				]);
				assert.deepEqual('click element .foo'.match(action.match), [
					'click element .foo',
					' element',
					'.foo'
				]);
				assert.deepEqual('click element .foo .bar .baz'.match(action.match), [
					'click element .foo .bar .baz',
					' element',
					'.foo .bar .baz'
				]);
			});

		});

		it('should have a build method', function() {
			assert.isFunction(action.build);
		});

		describe('.build(browser, page, options, matches)', function() {
			var matches;
			var page;
			var returnedValue;

			beforeEach(function() {
				page = {
					evaluate: sinon.stub().callsArgWithAsync(2, null, true)
				};
				matches = 'click element foo'.match(action.match);
				returnedValue = action.build({}, page, {}, matches);
			});

			it('returns a function', function() {
				assert.isFunction(returnedValue);
			});

			describe('returned function', function() {

				beforeEach(function(done) {
					returnedValue(done);
				});

				it('calls `page.evaluate` with a function and some action options', function() {
					assert.calledOnce(page.evaluate);
					assert.isFunction(page.evaluate.firstCall.args[0]);
					assert.deepEqual(page.evaluate.firstCall.args[1], {
						selector: matches[2]
					});
				});

				describe('evaluate function', function() {
					var element;
					var evaluateFunction;

					beforeEach(function() {
						evaluateFunction = page.evaluate.firstCall.args[0];
						element = {
							click: sinon.spy()
						};
						global.document = {
							querySelector: sinon.stub().returns(element)
						};
						returnedValue = evaluateFunction({
							selector: 'mock-selector'
						});
					});

					afterEach(function() {
						delete global.document;
					});

					it('selects an element with the given selector', function() {
						assert.calledOnce(document.querySelector);
						assert.calledWithExactly(document.querySelector, 'mock-selector');
					});

					it('clicks the selected element', function() {
						assert.calledOnce(element.click);
					});

					it('returns `true`', function() {
						assert.isTrue(returnedValue);
					});

					describe('when no element matches the given selector', function() {

						beforeEach(function() {
							element.click.reset();
							global.document.querySelector.returns(null);
							returnedValue = evaluateFunction({
								selector: 'mock-selector'
							});
						});

						it('does not click the selected element', function() {
							assert.notCalled(element.click);
						});

						it('returns `false`', function() {
							assert.isFalse(returnedValue);
						});

					});

				});

				describe('when `page.evaluate` calls back with a falsy result', function() {
					var caughtError;

					beforeEach(function(done) {
						page.evaluate.callsArgWithAsync(2, null, false);

						returnedValue(function(error) {
							caughtError = error;
							done();
						});
					});

					it('calls back with an error', function() {
						assert.instanceOf(caughtError, Error);
						assert.strictEqual(caughtError.message, 'Failed action: no element matching selector "foo"');
					});

				});

			});

		});

	});

	describe('set-field-value action', function() {
		var action;

		beforeEach(function() {
			action = buildAction.allowedActions.find(function(allowedAction) {
				return allowedAction.name === 'set-field-value';
			});
		});

		it('should have a name property', function() {
			assert.strictEqual(action.name, 'set-field-value');
		});

		it('should have a match property', function() {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', function() {

			it('should match all of the expected action strings', function() {
				assert.deepEqual('set .foo to bar'.match(action.match), [
					'set .foo to bar',
					undefined,
					'.foo',
					'bar'
				]);
				assert.deepEqual('set field .foo to bar'.match(action.match), [
					'set field .foo to bar',
					' field',
					'.foo',
					'bar'
				]);
				assert.deepEqual('set field .foo .bar .baz to hello world'.match(action.match), [
					'set field .foo .bar .baz to hello world',
					' field',
					'.foo .bar .baz',
					'hello world'
				]);
			});

		});

		it('should have a build method', function() {
			assert.isFunction(action.build);
		});

		describe('.build(browser, page, options, matches)', function() {
			var matches;
			var page;
			var returnedValue;

			beforeEach(function() {
				page = {
					evaluate: sinon.stub().callsArgWithAsync(2, null, true)
				};
				matches = 'set field foo to bar'.match(action.match);
				returnedValue = action.build({}, page, {}, matches);
			});

			it('returns a function', function() {
				assert.isFunction(returnedValue);
			});

			describe('returned function', function() {

				beforeEach(function(done) {
					returnedValue(done);
				});

				it('calls `page.evaluate` with a function and some action options', function() {
					assert.calledOnce(page.evaluate);
					assert.isFunction(page.evaluate.firstCall.args[0]);
					assert.deepEqual(page.evaluate.firstCall.args[1], {
						selector: matches[2],
						value: matches[3]
					});
				});

				describe('evaluate function', function() {
					var element;
					var evaluateFunction;

					beforeEach(function() {
						evaluateFunction = page.evaluate.firstCall.args[0];
						element = {
							dispatchEvent: sinon.spy()
						};
						global.document = {
							querySelector: sinon.stub().returns(element)
						};
						global.Event = sinon.stub().returns({});
						returnedValue = evaluateFunction({
							selector: 'mock-selector',
							value: 'mock-value'
						});
					});

					afterEach(function() {
						delete global.document;
						delete global.Event;
					});

					it('selects an element with the given selector', function() {
						assert.calledOnce(document.querySelector);
						assert.calledWithExactly(document.querySelector, 'mock-selector');
					});

					it('sets the element value', function() {
						assert.strictEqual(element.value, 'mock-value');
					});

					it('dispatches an input event', function() {
						assert.calledOnce(element.dispatchEvent);
					});

					it('returns `true`', function() {
						assert.isTrue(returnedValue);
					});

					describe('when no element matches the given selector', function() {

						beforeEach(function() {
							delete element.value;
							global.document.querySelector.returns(null);
							returnedValue = evaluateFunction({
								selector: 'mock-selector',
								value: 'mock-value'
							});
						});

						it('does not set the element value', function() {
							assert.isUndefined(element.value);
						});

						it('returns `false`', function() {
							assert.isFalse(returnedValue);
						});

					});

				});

				describe('when `page.evaluate` calls back with a falsy result', function() {
					var caughtError;

					beforeEach(function(done) {
						page.evaluate.callsArgWithAsync(2, null, false);

						returnedValue(function(error) {
							caughtError = error;
							done();
						});
					});

					it('calls back with an error', function() {
						assert.instanceOf(caughtError, Error);
						assert.strictEqual(caughtError.message, 'Failed action: no element matching selector "foo"');
					});

				});

			});

		});

	});

	describe('check-field action', function() {
		var action;

		beforeEach(function() {
			action = buildAction.allowedActions.find(function(allowedAction) {
				return allowedAction.name === 'check-field';
			});
		});

		it('should have a name property', function() {
			assert.strictEqual(action.name, 'check-field');
		});

		it('should have a match property', function() {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', function() {

			it('should match all of the expected action strings', function() {
				assert.deepEqual('check .foo'.match(action.match), [
					'check .foo',
					'check',
					undefined,
					'.foo'
				]);
				assert.deepEqual('check field .foo'.match(action.match), [
					'check field .foo',
					'check',
					' field',
					'.foo'
				]);
				assert.deepEqual('uncheck field .foo .bar .baz'.match(action.match), [
					'uncheck field .foo .bar .baz',
					'uncheck',
					' field',
					'.foo .bar .baz'
				]);
			});

		});

		it('should have a build method', function() {
			assert.isFunction(action.build);
		});

		describe('.build(browser, page, options, matches)', function() {
			var matches;
			var page;
			var returnedValue;

			beforeEach(function() {
				page = {
					evaluate: sinon.stub().callsArgWithAsync(2, null, true)
				};
				matches = 'check field foo'.match(action.match);
				returnedValue = action.build({}, page, {}, matches);
			});

			it('returns a function', function() {
				assert.isFunction(returnedValue);
			});

			describe('returned function', function() {

				beforeEach(function(done) {
					returnedValue(done);
				});

				it('calls `page.evaluate` with a function and some action options', function() {
					assert.calledOnce(page.evaluate);
					assert.isFunction(page.evaluate.firstCall.args[0]);
					assert.deepEqual(page.evaluate.firstCall.args[1], {
						checked: true,
						selector: matches[3]
					});
				});

				describe('evaluate function', function() {
					var element;
					var evaluateFunction;

					beforeEach(function() {
						evaluateFunction = page.evaluate.firstCall.args[0];
						element = {
							dispatchEvent: sinon.spy()
						};
						global.document = {
							querySelector: sinon.stub().returns(element)
						};
						global.Event = sinon.stub().returns({});
						returnedValue = evaluateFunction({
							selector: 'mock-selector',
							checked: true
						});
					});

					afterEach(function() {
						delete global.document;
						delete global.Event;
					});

					it('selects an element with the given selector', function() {
						assert.calledOnce(document.querySelector);
						assert.calledWithExactly(document.querySelector, 'mock-selector');
					});

					it('checks the selected element', function() {
						assert.isTrue(element.checked);
					});

					it('dispatches an input event', function() {
						assert.calledOnce(element.dispatchEvent);
					});

					it('returns `true`', function() {
						assert.isTrue(returnedValue);
					});

					describe('when the checked value is `false`', function() {

						beforeEach(function() {
							delete element.checked;
							returnedValue = evaluateFunction({
								selector: 'mock-selector',
								checked: false
							});
						});

						it('unchecks the selected element', function() {
							assert.isFalse(element.checked);
						});

						it('returns `true`', function() {
							assert.isTrue(returnedValue);
						});

					});

					describe('when no element matches the given selector', function() {

						beforeEach(function() {
							delete element.checked;
							global.document.querySelector.returns(null);
							returnedValue = evaluateFunction({
								selector: 'mock-selector',
								checked: true
							});
						});

						it('does not check the selected element', function() {
							assert.isUndefined(element.checked);
						});

						it('returns `false`', function() {
							assert.isFalse(returnedValue);
						});

					});

				});

				describe('when `page.evaluate` calls back with a falsy result', function() {
					var caughtError;

					beforeEach(function(done) {
						page.evaluate.callsArgWithAsync(2, null, false);

						returnedValue(function(error) {
							caughtError = error;
							done();
						});
					});

					it('calls back with an error', function() {
						assert.instanceOf(caughtError, Error);
						assert.strictEqual(caughtError.message, 'Failed action: no element matching selector "foo"');
					});

				});

			});

			describe('when `matches` indicates that the field should be unchecked', function() {

				beforeEach(function() {
					matches = 'uncheck field foo'.match(action.match);
					returnedValue = action.build({}, page, {}, matches);
				});

				describe('returned function', function() {

					beforeEach(function(done) {
						page.evaluate.resetHistory();
						returnedValue(done);
					});

					it('calls `page.evaluate` with the expected action options', function() {
						assert.calledOnce(page.evaluate);
						assert.deepEqual(page.evaluate.firstCall.args[1], {
							checked: false,
							selector: matches[3]
						});
					});

				});

			});

		});

	});

	describe('wait-for-element-state action', function() {
		var action;

		beforeEach(function() {
			action = buildAction.allowedActions.find(function(allowedAction) {
				return allowedAction.name === 'wait-for-element-state';
			});
		});

		it('should have a name property', function() {
			assert.strictEqual(action.name, 'wait-for-element-state');
		});

		it('should have a match property', function() {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', function() {

			it('should match all of the expected action strings', function() {
				assert.deepEqual('wait for .foo to be added'.match(action.match), [
					'wait for .foo to be added',
					undefined,
					'.foo',
					' to be',
					'added'
				]);
				assert.deepEqual('wait for element .foo to be added'.match(action.match), [
					'wait for element .foo to be added',
					' element',
					'.foo',
					' to be',
					'added'
				]);
				assert.deepEqual('wait for element .foo .bar to be added'.match(action.match), [
					'wait for element .foo .bar to be added',
					' element',
					'.foo .bar',
					' to be',
					'added'
				]);
				assert.deepEqual('wait for .foo to be removed'.match(action.match), [
					'wait for .foo to be removed',
					undefined,
					'.foo',
					' to be',
					'removed'
				]);
				assert.deepEqual('wait for element .foo to be removed'.match(action.match), [
					'wait for element .foo to be removed',
					' element',
					'.foo',
					' to be',
					'removed'
				]);
				assert.deepEqual('wait for element .foo .bar to be removed'.match(action.match), [
					'wait for element .foo .bar to be removed',
					' element',
					'.foo .bar',
					' to be',
					'removed'
				]);
				assert.deepEqual('wait for .foo to be visible'.match(action.match), [
					'wait for .foo to be visible',
					undefined,
					'.foo',
					' to be',
					'visible'
				]);
				assert.deepEqual('wait for element .foo to be visible'.match(action.match), [
					'wait for element .foo to be visible',
					' element',
					'.foo',
					' to be',
					'visible'
				]);
				assert.deepEqual('wait for element .foo .bar to be visible'.match(action.match), [
					'wait for element .foo .bar to be visible',
					' element',
					'.foo .bar',
					' to be',
					'visible'
				]);
				assert.deepEqual('wait for .foo to be hidden'.match(action.match), [
					'wait for .foo to be hidden',
					undefined,
					'.foo',
					' to be',
					'hidden'
				]);
				assert.deepEqual('wait for element .foo to be hidden'.match(action.match), [
					'wait for element .foo to be hidden',
					' element',
					'.foo',
					' to be',
					'hidden'
				]);
				assert.deepEqual('wait for element .foo .bar to be hidden'.match(action.match), [
					'wait for element .foo .bar to be hidden',
					' element',
					'.foo .bar',
					' to be',
					'hidden'
				]);
			});

		});

		it('should have a build method', function() {
			assert.isFunction(action.build);
		});

		describe('.build(browser, page, options, matches)', function() {
			var matches;
			var options;
			var page;
			var returnedValue;

			beforeEach(function() {
				options = {
					log: {
						debug: sinon.spy()
					}
				};
				page = {
					evaluate: sinon.stub().callsArgWithAsync(2, null, true)
				};
				matches = 'wait for element .foo to be added'.match(action.match);
				returnedValue = action.build({}, page, options, matches);
			});

			it('returns a function', function() {
				assert.isFunction(returnedValue);
			});

			describe('returned function', function() {
				beforeEach(function(done) {
					returnedValue(done);
				});
				it('calls `page.evaluate` with a function and some action options', function() {
					assert.calledOnce(page.evaluate);
					assert.isFunction(page.evaluate.firstCall.args[0]);
					assert.deepEqual(page.evaluate.firstCall.args[1], {
						state: matches[4],
						selector: matches[2]
					});
				});

				it('logs that the program is waiting', function() {
					assert.calledWith(options.log.debug, '  … waiting ("true")');
				});

				describe('evaluate function', function() {
					var element;
					var evaluateFunction;

					beforeEach(function() {
						evaluateFunction = page.evaluate.firstCall.args[0];
						element = {};
						global.document = {
							querySelector: sinon.stub().returns(element)
						};
					});

					afterEach(function() {
						delete global.window;
					});

					describe('when the state action option is "added"', function() {

						beforeEach(function() {
							returnedValue = evaluateFunction({
								state: 'added',
								selector: '.foo'
							});
						});

						afterEach(function() {
							delete global.document;
						});

						it('selects an element with the given selector', function() {
							assert.calledOnce(document.querySelector);
							assert.calledWithExactly(document.querySelector, '.foo');
						});

						it('returns `true`', function() {
							assert.isTrue(returnedValue);
						});
					});

					describe('when the state action option is "removed"', function() {

						beforeEach(function() {
							returnedValue = evaluateFunction({
								state: 'removed',
								selector: '.foo'
							});
						});

						afterEach(function() {
							delete global.document;
						});

						it('selects an element with the given selector', function() {
							assert.calledOnce(document.querySelector);
							assert.calledWithExactly(document.querySelector, '.foo');
						});

						it('returns `true`', function() {
							assert.isTrue(returnedValue);
						});
					});

					describe('when the state action option is "added" but without element', function() {

						beforeEach(function() {
							element = false;
							global.document = {
								querySelector: sinon.stub().returns(element)
							};
							returnedValue = evaluateFunction({
								state: 'added',
								selector: '.foo'
							});
						});

						afterEach(function() {
							delete global.document;
						});

						it('selects an element with the given selector', function() {
							assert.calledOnce(document.querySelector);
							assert.calledWithExactly(document.querySelector, '.foo');
						});

						it('returns `false`', function() {
							assert.isFalse(returnedValue);
						});
					});

					describe('when the state action option is "removed" but without element', function() {
						beforeEach(function() {
							element = null;
							global.document = {
								querySelector: sinon.stub().returns(element)
							};

							returnedValue = evaluateFunction({
								state: 'removed',
								selector: '.foo'
							});
						});

						afterEach(function() {
							delete global.document;
						});

						it('selects an element with the given selector', function() {
							assert.calledOnce(document.querySelector);
							assert.calledWithExactly(document.querySelector, '.foo');
							assert.isFalse(returnedValue);
						});
					});

					describe('when the state action option is visible', function() {
						beforeEach(function() {
							element = {
								offsetWidth: 10
							};
							global.document = {
								querySelector: sinon.stub().returns(element)
							};

							returnedValue = evaluateFunction({
								state: 'visible',
								selector: '.foo'
							});
						});

						afterEach(function() {
							delete global.document;
						});

						it('selects an element with the given selector', function() {
							assert.calledOnce(document.querySelector);
							assert.calledWithExactly(document.querySelector, '.foo');
							assert.isTrue(returnedValue);
						});
					});

					describe('when the state action option is hidden and element exists', function() {
						beforeEach(function() {
							element = {
								offsetWidth: 0,
								getClientRects: sinon.stub().returns([{
									bottom: 61,
									height: 17,
									left: 835.03125,
									right: 849.609375,
									top: 44,
									width: 14.578125
								}])
							};
							global.document = {
								querySelector: sinon.stub().returns(element)
							};

							returnedValue = evaluateFunction({
								state: 'hidden',
								selector: '.foo'
							});
						});

						afterEach(function() {
							delete global.document;
						});

						it('selects an element with the given selector', function() {
							assert.calledOnce(document.querySelector);
							assert.calledWithExactly(document.querySelector, '.foo');
							assert.isTrue(returnedValue);
						});
					});

					describe('when the state action option is hidden and element is not visible', function() {
						beforeEach(function() {
							element = {
								offsetWidth: 0,
								getClientRects: sinon.stub().returns([])
							};
							global.document = {
								querySelector: sinon.stub().returns(element)
							};

							returnedValue = evaluateFunction({
								state: 'hidden',
								selector: '.foo'
							});
						});

						afterEach(function() {
							delete global.document;
						});

						it('selects an element with the given selector', function() {
							assert.calledOnce(document.querySelector);
							assert.calledWithExactly(document.querySelector, '.foo');
							assert.isFalse(returnedValue);
						});
					});

				});
			});

			describe('when `page.evaluate` calls back with a result that doesn\'t match the expected value', function() {
				beforeEach(function(done) {
					sinon.stub(global, 'setTimeout').yieldsAsync();
					page.evaluate.callsArgWithAsync(2, null, false);
					page.evaluate.onCall(2).callsArgWithAsync(2, null, true);
					returnedValue(done);
				});

				afterEach(function() {
					global.setTimeout.restore();
				});

				it('sets a timeout', function() {
					assert.called(global.setTimeout);
					assert.isFunction(global.setTimeout.firstCall.args[0]);
					assert.strictEqual(global.setTimeout.firstCall.args[1], 200);
				});

				it('calls page.evaluate until it calls back with the expected value', function() {
					assert.calledThrice(page.evaluate);
					assert.calledThrice(options.log.debug);

					assert.calledWith(options.log.debug.firstCall, '  … waiting ("false")');
					assert.calledWith(options.log.debug.secondCall, '  … waiting ("false")');
					assert.calledWith(options.log.debug.thirdCall, '  … waiting ("true")');
				});
			});

			describe('when `page.evaluate` times out', function() {
				var caughtError;

				beforeEach(function(done) {
					sinon.stub(global, 'setTimeout').yieldsAsync();
					page.evaluate.callsArgWithAsync(2, null, false);
					page.evaluate.onCall(11).callsArgWithAsync(2, null, true);
					returnedValue(function(error) {
						caughtError = error;
						done();
					});
				});

				afterEach(function() {
					global.setTimeout.restore();
				});

				it('throws an error after 10 retries', function() {
					assert.strictEqual(caughtError.message, 'Failed action: element ".foo" failed to be added');
				});
			});

		});

		describe('.build(browser, page, options, matches)', function() {
			var matches;
			var options;
			var page;
			var returnedValue;

			beforeEach(function() {
				options = {
					log: {
						debug: sinon.spy()
					}
				};
				page = {
					evaluate: sinon.stub().callsArgWithAsync(2, null, true)
				};
				matches = 'wait for element .foo to be visible'.match(action.match);
				returnedValue = action.build({}, page, options, matches);
			});

			describe('when `page.evaluate` is called and state is added and result is true', function() {
				beforeEach(function(done) {
					sinon.stub(global, 'setTimeout').yieldsAsync();
					page.evaluate.callsArgWithAsync(2, null, true);
					returnedValue(done);
				});

				afterEach(function() {
					global.setTimeout.restore();
				});

				it('does not wait', function() {
					assert.isFalse(global.setTimeout.called);
				});
			});
		});
	});

	describe('wait-for-url action', function() {
		var action;

		beforeEach(function() {
			action = buildAction.allowedActions.find(function(allowedAction) {
				return allowedAction.name === 'wait-for-url';
			});
		});

		it('should have a name property', function() {
			assert.strictEqual(action.name, 'wait-for-url');
		});

		it('should have a match property', function() {
			assert.instanceOf(action.match, RegExp);
		});

		describe('.match', function() {

			it('should match all of the expected action strings', function() {
				assert.deepEqual('wait for fragment #foo'.match(action.match), [
					'wait for fragment #foo',
					'fragment',
					undefined,
					undefined,
					'#foo'
				]);
				assert.deepEqual('wait for fragment to be #foo'.match(action.match), [
					'wait for fragment to be #foo',
					'fragment',
					' to be',
					undefined,
					'#foo'
				]);
				assert.deepEqual('wait for hash to be #foo'.match(action.match), [
					'wait for hash to be #foo',
					'hash',
					' to be',
					undefined,
					'#foo'
				]);
				assert.deepEqual('wait for path to be /foo'.match(action.match), [
					'wait for path to be /foo',
					'path',
					' to be',
					undefined,
					'/foo'
				]);
				assert.deepEqual('wait for host to be example.com'.match(action.match), [
					'wait for host to be example.com',
					'host',
					' to be',
					undefined,
					'example.com'
				]);
				assert.deepEqual('wait for url to be https://example.com/'.match(action.match), [
					'wait for url to be https://example.com/',
					'url',
					' to be',
					undefined,
					'https://example.com/'
				]);
				assert.deepEqual('wait for fragment to not be #bar'.match(action.match), [
					'wait for fragment to not be #bar',
					'fragment',
					' to not be',
					'not ',
					'#bar'
				]);
				assert.deepEqual('wait for hash to not be #bar'.match(action.match), [
					'wait for hash to not be #bar',
					'hash',
					' to not be',
					'not ',
					'#bar'
				]);
				assert.deepEqual('wait for path to not be /sso/login'.match(action.match), [
					'wait for path to not be /sso/login',
					'path',
					' to not be',
					'not ',
					'/sso/login'
				]);
				assert.deepEqual('wait for url to not be https://example.com/login'.match(action.match), [
					'wait for url to not be https://example.com/login',
					'url',
					' to not be',
					'not ',
					'https://example.com/login'
				]);
				assert.deepEqual('wait for host to not be example.com'.match(action.match), [
					'wait for host to not be example.com',
					'host',
					' to not be',
					'not ',
					'example.com'
				]);
			});

		});

		it('should have a build method', function() {
			assert.isFunction(action.build);
		});

		describe('.build(browser, page, options, matches)', function() {
			var matches;
			var options;
			var page;
			var returnedValue;

			beforeEach(function() {
				options = {
					log: {
						debug: sinon.spy()
					}
				};
				page = {
					evaluate: sinon.stub().callsArgWithAsync(2, null, 'foo')
				};
				matches = 'wait for path to be foo'.match(action.match);
				returnedValue = action.build({}, page, options, matches);
			});

			it('returns a function', function() {
				assert.isFunction(returnedValue);
			});

			describe('returned function', function() {

				beforeEach(function(done) {
					returnedValue(done);
				});

				it('calls `page.evaluate` with a function and some action options', function() {
					assert.calledOnce(page.evaluate);
					assert.isFunction(page.evaluate.firstCall.args[0]);
					assert.deepEqual(page.evaluate.firstCall.args[1], {
						expectedValue: matches[4],
						negated: false,
						subject: matches[1]
					});
				});

				it('logs that the program is waiting', function() {
					assert.calledWith(options.log.debug, '  … waiting ("foo")');
				});

				describe('evaluate function', function() {
					var evaluateFunction;

					beforeEach(function() {
						evaluateFunction = page.evaluate.firstCall.args[0];
						global.window = {
							location: {
								hash: 'mock-hash',
								href: 'mock-href',
								pathname: 'mock-pathname'
							}
						};
					});

					afterEach(function() {
						delete global.window;
					});

					describe('when the subject action option is "fragment"', function() {

						beforeEach(function() {
							returnedValue = evaluateFunction({
								subject: 'fragment'
							});
						});

						it('returns `window.location.hash`', function() {
							assert.strictEqual(returnedValue, global.window.location.hash);
						});

					});

					describe('when the subject action option is "hash"', function() {

						beforeEach(function() {
							returnedValue = evaluateFunction({
								subject: 'hash'
							});
						});

						it('returns `window.location.hash`', function() {
							assert.strictEqual(returnedValue, global.window.location.hash);
						});

					});

					describe('when the subject action option is "path"', function() {

						beforeEach(function() {
							returnedValue = evaluateFunction({
								subject: 'path'
							});
						});

						it('returns `window.location.pathname`', function() {
							assert.strictEqual(returnedValue, global.window.location.pathname);
						});

					});

					describe('when the subject action option is "url"', function() {

						beforeEach(function() {
							returnedValue = evaluateFunction({
								subject: 'url'
							});
						});

						it('returns `window.location.href`', function() {
							assert.strictEqual(returnedValue, global.window.location.href);
						});

					});

					describe('when the subject action option is "host"', function() {

						beforeEach(function() {
							returnedValue = evaluateFunction({
								subject: 'host'
							});
						});

						it('returns `window.location.host`', function() {
							assert.strictEqual(returnedValue, global.window.location.host);
						});

					});

				});

				describe('handles negation appropriately', function() {

					beforeEach(function(done) {
						page.evaluate.resetHistory();
						matches = 'wait for url to not be https://portal.com/login'.match(action.match);
						returnedValue = action.build({}, page, options, matches);
						returnedValue(done);
					});

					it('checks for inequality if match string contains `to not be`', function() {
						assert.called(page.evaluate);
						assert.deepEqual(page.evaluate.firstCall.args[1], {
							expectedValue: 'https://portal.com/login',
							negated: true,
							subject: 'url'
						});
					});

				});

			});

			describe('when `page.evaluate` calls back with a result that doesn\'t match the expected value', function() {

				beforeEach(function(done) {
					sinon.stub(global, 'setTimeout').yieldsAsync();
					page.evaluate.callsArgWithAsync(2, null, 'bar');
					page.evaluate.onCall(2).callsArgWithAsync(2, null, 'foo');
					returnedValue(done);
				});

				afterEach(function() {
					global.setTimeout.restore();
				});

				it('sets a timeout', function() {
					assert.called(global.setTimeout);
					assert.isFunction(global.setTimeout.firstCall.args[0]);
					assert.strictEqual(global.setTimeout.firstCall.args[1], 200);
				});

				it('calls page.evaluate until it calls back with the expected value', function() {
					assert.calledThrice(page.evaluate);
					assert.calledThrice(options.log.debug);
					assert.calledWith(options.log.debug.firstCall, '  … waiting ("bar")');
					assert.calledWith(options.log.debug.secondCall, '  … waiting ("bar")');
					assert.calledWith(options.log.debug.thirdCall, '  … waiting ("foo")');
				});

			});

		});

	});


});

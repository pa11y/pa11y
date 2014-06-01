/* jshint maxstatements: false, maxlen: false */
/* global afterEach, beforeEach, describe, it */
'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var sinon = require('sinon');

describe('dom-test', function () {
    var async, domTest, jsdom, mockDom;

    beforeEach(function () {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false,
            warnOnReplace: false
        });
        mockDom = null;
        jsdom = {
            env: sinon.spy(function (opts) {
                if (opts.done) {
                    opts.done(null, mockDom);
                }
            })
        };
        mockery.registerMock('jsdom', jsdom);
        async = require('async');
        domTest = require('../lib/dom-test');
    });

    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    it('should be an object', function () {
        assert.isObject(domTest);
    });

    it('should have a `createTester` method', function () {
        assert.isFunction(domTest.createTester);
    });

    describe('.createTester()', function () {

        it('should return a function (tester)', function () {
            assert.isFunction(domTest.createTester());
        });

    });

    describe('tester()', function () {

        it('should error when called with a non-string', function () {
            var tester = domTest.createTester();
            var msg = 'context argument must be a string';
            var fn = function () {};
            assert.throws(tester.bind(null, null, fn), msg);
            assert.throws(tester.bind(null, 1, fn), msg);
            assert.throws(tester.bind(null, {}, fn), msg);
        });

        it('should error when called without a callback', function () {
            var tester = domTest.createTester();
            var msg = 'done argument must be a function';
            assert.throws(tester.bind(null, '', null), msg);
            assert.throws(tester.bind(null, '', 1), msg);
            assert.throws(tester.bind(null, '', {}), msg);
        });

        it('should call the callback', function (done) {
            var tester = domTest.createTester();
            tester('foo', done);
        });

        it('should create a DOM object with the expected HTML', function (done) {
            var tester = domTest.createTester();
            tester('foo', function () {
                assert.strictEqual(jsdom.env.callCount, 1);
                assert.strictEqual(jsdom.env.getCall(0).args[0].html, 'foo');
                done();
            });
        });

        it('should create a DOM object with the expected HTML when the context string is empty', function (done) {
            var tester = domTest.createTester();
            tester('', function () {
                assert.strictEqual(jsdom.env.getCall(0).args[0].html, '<!-- -->');
                done();
            });
        });

        it('should load jQuery', function (done) {
            var tester = domTest.createTester();
            tester('foo', function () {
                assert.deepEqual(jsdom.env.getCall(0).args[0].scripts, ['../node_modules/jquery/dist/jquery.js']);
                done();
            });
        });

        it('should not load jQuery if `options.jquery` is `false`', function (done) {
            var tester = domTest.createTester({
                jquery: false
            });
            tester('foo', function () {
                assert.deepEqual(jsdom.env.getCall(0).args[0].scripts, []);
                done();
            });
        });

        it('should call each test function with the DOM object, a report function, and a callback', function (done) {
            var test1 = sinon.stub().callsArg(2);
            var test2 = sinon.stub().callsArg(2);
            var tester = domTest.createTester({
                tests: [test1, test2]
            });
            mockDom = {foo: 'bar'};
            tester('foo', function () {
                assert.isTrue(test1.withArgs(mockDom).calledOnce);
                assert.isFunction(test1.getCall(0).args[1]);
                assert.isFunction(test1.getCall(0).args[2]);
                assert.isTrue(test2.withArgs(mockDom).calledOnce);
                assert.isFunction(test2.getCall(0).args[1]);
                assert.isFunction(test2.getCall(0).args[2]);
                done();
            });
        });

        it('should callback with an array of test results', function (done) {
            var test1 = function (dom, report, done) {
                report('foo');
                done();
            };
            var test2 = function (dom, report, done) {
                done();
            };
            var test3 = function (dom, report, done) {
                report('bar');
                report('baz');
                done();
            };
            var tester = domTest.createTester({
                tests: [test1, test2, test3]
            });
            tester('foo', function (err, results) {
                assert.deepEqual(results, ['foo', 'bar', 'baz']);
                done();
            });
        });

        it('should run tests in parallel', function (done) {
            var tester = domTest.createTester();
            sinon.spy(async, 'parallelLimit');
            tester('foo', function () {
                assert.strictEqual(async.parallelLimit.callCount, 1, 'function was called');
                assert.strictEqual(async.parallelLimit.getCall(0).args[1], 10, 'has correct default concurrency');
                async.parallelLimit.restore();
                done();
            });
        });

        it('should run `options.concurrency` number of tests in parallel', function (done) {
            var tester = domTest.createTester({
                concurrency: 20
            });
            sinon.spy(async, 'parallelLimit');
            tester('foo', function () {
                assert.strictEqual(async.parallelLimit.getCall(0).args[1], 20);
                async.parallelLimit.restore();
                done();
            });
        });

    });

});
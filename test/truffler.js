/* jshint maxstatements: false, maxlen: false */
/* global afterEach, beforeEach, describe, it */
'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var sinon = require('sinon');

describe('truffler', function () {
    var async, truffler, jsdom, mockDom, pkg;

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
        pkg = require('../package.json');
        truffler = require('../lib/truffler');
    });

    afterEach(function () {
        mockery.deregisterAll();
        mockery.disable();
    });

    it('should be an object', function () {
        assert.isObject(truffler);
    });

    it('should have an `init` method', function () {
        assert.isFunction(truffler.init);
    });

    describe('.init()', function () {

        it('should return a function (test)', function () {
            assert.isFunction(truffler.init());
        });

        describe('test()', function () {

            it('should error when called with a non-string', function () {
                var test = truffler.init();
                var msg = 'context argument must be a string';
                var fn = function () {};
                assert.throws(test.bind(null, null, fn), msg);
                assert.throws(test.bind(null, 1, fn), msg);
                assert.throws(test.bind(null, {}, fn), msg);
            });

            it('should error when called without a callback', function () {
                var test = truffler.init();
                var msg = 'done argument must be a function';
                assert.throws(test.bind(null, '', null), msg);
                assert.throws(test.bind(null, '', 1), msg);
                assert.throws(test.bind(null, '', {}), msg);
            });

            it('should call the callback', function (done) {
                var test = truffler.init();
                test('foo', done);
            });

            it('should create a DOM object with the expected URL', function (done) {
                var test = truffler.init();
                test('http://foo/', function () {
                    assert.strictEqual(jsdom.env.getCall(0).args[0].url, 'http://foo/');
                    done();
                });
            });

            it('should create a DOM object with the expected HTML', function (done) {
                var test = truffler.init();
                test('foo', function () {
                    assert.strictEqual(jsdom.env.callCount, 1);
                    assert.strictEqual(jsdom.env.getCall(0).args[0].html, 'foo');
                    done();
                });
            });

            it('should create a DOM object with the expected HTML when the context string is empty', function (done) {
                var test = truffler.init();
                test('', function () {
                    assert.strictEqual(jsdom.env.getCall(0).args[0].html, '<!-- -->');
                    done();
                });
            });

            it('should call each test function with the DOM object, a report function, and a callback', function (done) {
                var test1 = sinon.stub().callsArg(2);
                var test2 = sinon.stub().callsArg(2);
                var test = truffler.init([test1, test2]);
                mockDom = {foo: 'bar'};
                test('foo', function () {
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
                var test = truffler.init([test1, test2, test3]);
                test('foo', function (err, results) {
                    assert.deepEqual(results, ['foo', 'bar', 'baz']);
                    done();
                });
            });

            it('should callback with an error if a test passes one on', function (done) {
                var error = new Error('oops');
                var test1 = function (dom, report, done) {
                    done(error);
                };
                var test = truffler.init([test1]);
                test('foo', function (err) {
                    assert.strictEqual(err, error);
                    done();
                });
            });

            it('should callback with an error if a test throws', function (done) {
                var error = new Error('oops');
                var test1 = function () {
                    throw error;
                };
                var test = truffler.init([test1]);
                test('foo', function (err) {
                    assert.strictEqual(err, error);
                    done();
                });
            });

            it('should load no scripts if none are specified', function (done) {
                var test = truffler.init();
                test('http://foo/', function () {
                    assert.deepEqual(jsdom.env.getCall(0).args[0].scripts, []);
                    done();
                });
            });

            it('should load the expected scripts when specified', function (done) {
                var test = truffler.init([], {
                    scripts: ['foo', 'bar']
                });
                test('http://foo/', function () {
                    assert.deepEqual(jsdom.env.getCall(0).args[0].scripts, ['foo', 'bar']);
                    done();
                });
            });

            it('should run tests in parallel', function (done) {
                var test = truffler.init();
                sinon.spy(async, 'parallelLimit');
                test('foo', function () {
                    assert.strictEqual(async.parallelLimit.callCount, 1, 'function was called');
                    assert.strictEqual(async.parallelLimit.getCall(0).args[1], 10, 'has correct default concurrency');
                    async.parallelLimit.restore();
                    done();
                });
            });

            it('should run the expected number of tests in parallel when specified', function (done) {
                var test = truffler.init([], {
                    concurrency: 20
                });
                sinon.spy(async, 'parallelLimit');
                test('foo', function () {
                    assert.strictEqual(async.parallelLimit.getCall(0).args[1], 20);
                    async.parallelLimit.restore();
                    done();
                });
            });

            it('should set a name/version user-agent string if a URL is tested', function (done) {
                var test = truffler.init();
                test('http://foo/', function () {
                    assert.deepEqual(jsdom.env.getCall(0).args[0].headers['User-Agent'], pkg.name + '/' + pkg.version);
                    done();
                });
            });

            it('should set a custom user-agent string when specified', function (done) {
                var test = truffler.init([], {
                    useragent: 'foo'
                });
                test('http://foo/', function () {
                    assert.deepEqual(jsdom.env.getCall(0).args[0].headers['User-Agent'], 'foo');
                    done();
                });
            });

        });

    });

});
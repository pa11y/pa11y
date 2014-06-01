'use strict';

var _ = require('underscore');
var async = require('async');
var jsdom = require('jsdom');

exports.createTester = createTester;

// Create a tester function
function createTester (opts) {
    opts = defaultOptions(opts);
    function domTester (context, done) {
        if (typeof context !== 'string') {
            throw new Error('context argument must be a string');
        }
        if (typeof done !== 'function') {
            throw new Error('done argument must be a function');
        }
        runTests(opts, context, done);
    }
    return domTester;
}

// Default the tester options
function defaultOptions (opts) {
    return _.extend({}, {
        concurrency: 10,
        jquery: true,
        tests: []
    }, opts);
}

// Run tests against a context
function runTests (opts, context, done) {
    jsdom.env({
        html: context || '<!-- -->',
        scripts: getDomScripts(opts),
        done: function (err, dom) {
            var results = [];
            var tests = opts.tests
                .filter(_.isFunction)
                .map(prepareTest.bind(null, dom, results.push.bind(results)));
            async.parallelLimit(tests, opts.concurrency, function (err) {
                done(err, results.filter(isDefined));
            });
        }
    });
}

// Get the scripts to load into the DOM
function getDomScripts (opts) {
    var scripts = [];
    if (opts.jquery) {
        scripts.push('../node_modules/jquery/dist/jquery.js');
    }
    return scripts;
}

// Prepare a test for async running
function prepareTest (dom, report, test) {
    return function (next) {
        test(dom, report, next.bind(null, null));
    };
}

// Check whether a value is defined (not `undefined`)
function isDefined (val) {
    return (val !== undefined);
}

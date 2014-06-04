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
    var config = buildJsdomConfig(opts, context);
    config.done = function (err, dom) {
        var results = [];
        var tests = opts.tests
            .filter(_.isFunction)
            .map(prepareTest.bind(null, dom, results.push.bind(results)));
        async.parallelLimit(tests, opts.concurrency, function (err) {
            done(err, results.filter(isDefined));
        });
    };
    jsdom.env(config);
}

// Build the JSDom config
function buildJsdomConfig (opts, context) {
    if (/^[a-z]+:\/\//i.test(context)) {
        return buildJsdomConfigWithUrl(opts, context);
    } else {
        return buildJsdomConfigWithHtml(opts, context);
    }
}

// Build the JSDom config with a URL
function buildJsdomConfigWithUrl (opts, url) {
    var config = {
        url: url
    };
    if (opts.jquery) {
        config.scripts = ['http://code.jquery.com/jquery-2.1.1.js'];
    }
    return config;
}

function buildJsdomConfigWithHtml (opts, html) {
    var config = {
        html: html || '<!-- -->'
    };
    if (opts.jquery) {
        config.scripts = ['../node_modules/jquery/dist/jquery.js'];
    }
    return config;
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

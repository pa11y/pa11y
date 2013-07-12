/* jshint maxlen: 200 */
/* global describe, it */
'use strict';

var assert = require('proclaim');

describe('pa11y', function () {
	var pa11y = require('../../lib/pa11y');

	it('should be an object', function () {
		assert.isObject(pa11y);
	});

    it('should have an applyDefaultOpts function', function () {
        assert.isFunction(pa11y.applyDefaultOpts);
    });

    it('should have a sniff function', function () {
        assert.isFunction(pa11y.sniff);
    });

    describe('.applyDefaultOpts()', function () {

        it('should return the expected object when no options are set', function () {
            assert.deepEqual(pa11y.applyDefaultOpts({}), {
                debug: false,
                htmlcs: 'http://squizlabs.github.io/HTML_CodeSniffer/build/HTMLCS.js',
                reporter: 'console',
                standard: 'WCAG2AA',
                timeout: 30000
            });
        });

        it('should return the expected object when all options are set', function () {
            var opts = {
                debug: true,
                htmlcs: 'foo',
                reporter: 'bar',
                standard: 'baz',
                timeout: 123
            };
            assert.deepEqual(pa11y.applyDefaultOpts(opts), opts);
        });

        it('should return the expected object when some options are set', function () {
            assert.deepEqual(pa11y.applyDefaultOpts({
                debug: true,
                reporter: 'foo',
                timeout: 123
            }), {
                debug: true,
                htmlcs: 'http://squizlabs.github.io/HTML_CodeSniffer/build/HTMLCS.js',
                reporter: 'foo',
                standard: 'WCAG2AA',
                timeout: 123
            });
        });

    });

});

Troubleshooting
=====

Common Issues
----
* It's common for Pa11y to test the wrong page when run against an **AngularJS** app, given it can begin testing before an appropriate view has been loaded.
    * Here's an issue with comments to the suggested resolution to that problem: [#174](https://github.com/pa11y/pa11y/issues/174#issuecomment-231029925)
* [HTML Codesniffer bookmarklet](http://squizlabs.github.io/HTML_CodeSniffer/) shows results that are different from Pa11y:
    * There can be lots of different reasons for that and we'll never cover all of them, but some of the most common we've seen are:
        * the page is being tested before it's fully loaded, in which case you can add a "wait", or wait for some event to fire (like in the Angular example above).
        * The bookmarklet parses and tests the contents of iframes, but due to the way [PhantomJS](https://github.com/ariya/phantomjs/issues/10421) works, Pa11y isn't able to see inside iframes for testing. Note: HTML Codesniffer command line tool has the same limitation.
            * The best solution to this is to test the iframed sources directly.


Common Questions
----
If you're looking for common questions about implementing specific tests with Pa11y, take a look at the [Common Questions](https://github.com/pa11y/pa11y#common-questions) section of the README.


Check to see if the issue has been reported
-----

Check the [issue tracker](https://github.com/pa11y/pa11y/issues?utf8=%E2%9C%93&q=is%3Aissue) for similar issues.

Create an issue
-----

If all else fails, [create an issue](https://github.com/pa11y/pa11y/issues/new) and we'll help you.

Please include your Node.js, Phantom, and Pa11y version numbers, and your operating system.

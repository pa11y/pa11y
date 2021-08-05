# Changelog

## 6.0.1 (2021-06-28)

* Merge axe and htmlcs runners into repo
* `--environment` flag now shows pa11y version correctly (thanks @aarongoldenthal)
* Tests and dependency fixes for runners and reporters (thanks @aarongoldenthal)

## 6.0.0 (2021-05-26)

* Test against WCAG 2.1 rules when using the default HTML_CodeSniffer runner.
* Upgrade puppeteer to v9, which reduces the number of browser crashes significantly.
* Remove support for testing against Section 508 standard.
* Replace `make` commands for testing with npm scripts (thanks @sonniesedge and @paazmaya).
* Integrate the built-in reporters with the pa11y repo (thanks @joeyciechanowicz).
* Improve resilience of tests and other quality of life improvements (thanks @sangitamane).
* Improve `--environment` output (thanks @ryhinchey).
* Drop support for Node.js versions older than 12.

## 6.0.0-alpha (2020-04-28)

* Update HTML_CodeSniffer to 2.5.1, which includes support for WCAG 2.1
* Drop support for Node.js versions older than 10.

## 5.3.1 (2021-04-01)

* Removed survey link from README.md file.
* Update the HTML_CodeSniffer runner so it doesn't install a version with WCAG 2.1 rules. See [pa11y/pa11y-runner-htmlcs@f22d3d1](https://github.com/pa11y/pa11y-runner-htmlcs/commit/f22d3d1d65bba415ca3415eb526123b301ecdd64) for details.
* Pin other dependencies in order to avoid problems like the one just mentioned.

## 5.3.0 (2019-09-30)

* Adds support for [aXe](https://www.deque.com/axe/) test runner (thanks @rowanmanning)
* Adds support for multiple test runners (thanks @rowanmanning)
* Adds support for sites using `AMD` (thanks @joeyciechanowicz)
* Removes dependency on `fs-extra` (thanks @timnovis)
* Improves JSDoc typings (thanks @josebolos)
* Inverts the order of `setViewport` and `goto` to prevent accidental page reloads (thanks @josebolos)
* Minor documentation updates (thanks @sjparkinson, @josebolos)

## 5.2.0 (2019-07-04)

* Allow pa11y to use an existing puppeteer page instance (thanks @kevinatown)
* Fixed a bug where `set field` may fail if the text contains the string " to " (thanks @kkoskelin)
* Use npm version of HTML_CodeSniffer instead of a static one (thanks @paazmaya) and update to version 2.4.0
* Add a `package-lock.json` file to the package
* Several dependency and tooling updates (thanks @leeroyrose and others)
* Other bugfixes (thanks @joeyciechanowicz)
* Minor documentation updates

## 5.1.0 (2018-10-18)

* Intercept first page requests only when necessary, to [work around a Puppeteer bug](https://github.com/pa11y/pa11y/issues/421).
* Add an .nvmrc file to specify the minimum Node version already [listed in the requirements](https://github.com/pa11y/pa11y#requirements)
* Update dependencies
  * commander: ^2.14.1 to ^2.19.0
  * eslint: ^4.17.0 to ^4.19.1
  * mocha: ^5.0.1 to ^5.2.0
  * nyc: ^11.4.1 to ^11.9.0
  * puppeteer: ^1.4.0 to ^1.9.0
  * semver: ^5.5.0 to ^5.6.0
  * sinon: ^4.3.0 to ^4.5.0
  * HTML CodeSniffer: 2.1.1 to 2.2.0

## 5.0.4 (2018-05-21)

* Update dependencies
  * puppeteer: 1.0.0 to ^1.4.0
* Correct and clarify some of the documentation

## 5.0.3 (2018-03-09)

* Fix an issue caused by a site having a global `module.exports` property

## 5.0.2 (2018-03-08)

* Pin puppeteer at 1.0.0 to fix file URL issues

## 5.0.1 (2018-02-16)

* Update dependencies
  * commander: ^2.9.0 to ^2.14.1
  * p-timeout: ^1.2.0 to ^2.0.1
  * semver: ^5.4.1 to ^5.5.0
  * eslint: ^3.1.8 to ^4.17.0
  * mocha: ^3.2.0 to ^5.0.1
  * nyc: ^10.1.2 to ^11.4.1
  * proclaim: ^3.4.4 to ^3.5.1
  * sinon: ^3.2.0 to ^4.3.0

## 5.0.0 (2018-02-15)

* See the [migration guide](https://github.com/pa11y/pa11y/blob/master/MIGRATION.md#migrating-from-40-to-50) for details

## 5.0.0-beta.10 pre-release (2018-02-14)

* Allow passing in a Chrome page instance to a test

## 5.0.0-beta.9 pre-release (2018-01-30)

* Update dependencies
  * pa11y-reporter-cli: ^1.0.0 to ^1.0.1

## 5.0.0-beta.8 pre-release (2018-01-22)

* Allow sharing a Chrome browser instance between test runs
* Fix Content-Security-Policy issues

## 5.0.0-beta.7 pre-release (2018-01-17)

* Fix browser logging

## 5.0.0-beta.6 pre-release (2018-01-16)

* Add the `navigate-url` action
* Correct documentation on `isValidAction`
* Update dependencies
  * puppeteer: ^0.13.0 to ^1.0.0

## 5.0.0-beta.5 pre-release (2017-12-11)

* Update dependencies
  * puppeteer: ^0.11.0 to ^0.13.0

## 5.0.0-beta.4 pre-release (2017-12-06)

* Add reporter, threshold and level as configuration options
* Clarify some documentation

## 5.0.0-beta.3 pre-release (2017-11-26)

* Fix a timeout issue
* Fix an issue with the built in copy of HTML CodeSniffer

## 5.0.0-beta.2 pre-release (2017-10-04)

* Output browser console messages to the debug log
* Add the `screen-capture` action
* Add the `wait-for-element-event` action
* Update dependencies
  * puppeteer: ^0.10.2 to ^0.11.0
  * pa11y-lint-config: ^1.2.0 to ^1.2.1

## 5.0.0-beta.1 pre-release (2017-09-11)

* See the [migration guide](https://github.com/pa11y/pa11y/blob/5.x/MIGRATION.md#migrating-from-40-to-50) for details

## 4.13.2 (2017-11-26)

* Fix an issue with the built in copy of HTML CodeSniffer

## 4.13.1 (2017-10-16)

* Trigger correct change/input events for check-field and set-field-value actions

## 4.13.0 (2017-09-15)

* Update dependencies
  * HTML CodeSniffer: 2.0.7 to 2.1.1

## 4.12.2 (2017-09-11)

* Exit with an error when using an incompatible command-line reporter

## 4.12.1 (2017-08-23)

* Roll back dependencies
  * HTML CodeSniffer: 2.1.0 to 2.0.7

## 4.12.0 (2017-08-23)

* Add the `wait-for-element-state` action
* Update the `wait-for-url` action to support waiting for hostname
* Update dependencies
  * HTML CodeSniffer: 2.0.7 to 2.1.0
* Lots of updates to the README and trouble-shooting guide
* Support Node.js 8.x

## 4.11.0 (2017-06-02)

* Add the ability to make Pa11y perform POST requests
* Documentation improvements
* Update dependencies
  * truffler: ^3.0.1 to ^3.1.0

## 4.10.0 (2017-04-18)

* Update example URLs across the project for clarity
* Add a TSV reporter

## 4.9.0 (2017-03-29)

* Add the ability to add additional WCAG rules to the selected standard
* Update dependencies
  * async: ~1.4 to ^2.2.0
  * bfj: ~1.2 to ^2.1.2
  * chalk: ~1.1 to ^1.1.3
  * commander: ~2.8 to ^2.9.0
  * lower-case: ~1.1 to ^1.1.4
  * node.extend: ~1.1 to ^1.1.6
  * once: ~1.3 to ^1.4.0
  * truffler: ~3.0 to ^3.0.1
  * mocha: ^3 to ^3.2.0
  * mockery: ~1.4 to ^2.0.0
  * proclaim: ^3 to ^3.4.4
  * sinon: ^1 to ^2.1.0
* Use the standard Pa11y lint config
* Update the tooling for consistency with other projects

## 4.8.0 (2017-03-17)

* Add the `--environment` flag for easier debugging
* Update the Windows requirements to include Windows 10
* Update the trouble-shooting guide and common questions

## 4.7.0 (2017-03-08)

* Add the ability to screen capture the tested page
* Move the main bin to a .js file
* Clean up coveralls

## 4.6.0 (2017-01-30)

* Add negation to the "wait for..." actions

## 4.5.0 (2017-01-25)

* Expose action validation for use in dependent projects

## 4.4.0 (2017-01-19)

* Add support for actions

## 4.3.0 (2016-12-15)

* Add a `verifyPage` option, and a `--verify-page` flag
* Switch from JSHint/JSCS to ESLint
* Add a contributing guide
* Update dependencies
  * istanbul: ~0.3 to ~0.4

## 4.2.0 (2016-11-25)

* Display the page title in the logs to help with debugging

## 4.1.1 (2016-11-24)

* Update dependencies
  * truffler: ~2.3 to ~3.0

## 4.1.0 (2016-11-21)

* Install PhantomJS as a dependency if the latest version isn't present
* Remove the SSL protocol from the default PhantomJS config

## 4.0.3 (2016-11-20)

* Add protocols to URLs, make path instructions explicit

## 4.0.2 (2016-11-10)

* Update dependencies
  * truffler: ~2.2 to ~2.3
* Fix typos and mistakes across the documentation

## 4.0.1 (2016-08-18)

* Upgrade mocha to version 3. This fixes a security vuln with versions of minimatch older than
3.0.2. Minimatch is one of mocha's dependencies. This only affects `devDependencies`.
* Documentation updates.

## 4.0.0 (2016-06-05)

* Drop Node.js 0.12 support
* See the [migration guide](https://github.com/pa11y/pa11y/blob/master/MIGRATION.md#migrating-from-30-to-40) for details

## 3.8.1 (2016-06-03)

* Fixes the `hideElements` option

## 3.8.0 (2016-05-25)

* Make the built-in reporters usable in JavaScript
* Tidy up the examples

## 3.7.1 (2016-05-03)

* Support Node.js 6.x

## 3.7.0 (2016-04-27)

* Update dependencies
  * truffler: ~2.1 to ~2.2
  * HTML CodeSniffer: 2.0.1 to 2.0.7

## 3.6.0 (2016-03-01)

* Adding the `rootElement` option so a subset of the document can be tested
* Adding the `hideElements` option so elements can be hidden from testing

## 3.5.1 (2016-02-09)

* Update repository references to springernature
* Update the license

## 3.5.0 (2016-02-09)

* Adding the `beforeScript` option so JavaScript can be run on the page before testing
* Re-license under the LGPL 3.0

## 3.4.0 (2016-02-01)

* Document running Pa11y against local files
* Add a trouble-shooting guide for Windows
* Make allowed standards configurable

## 3.3.0 (2016-01-11)

* Add the ability to use the `--ignore` command line more than once

## 3.2.1 (2016-01-05)

* Fix an issue where JSON output was truncated

## 3.2.0 (2015-12-17)

* Add a threshold CLI parameter to allow a certain number of errors before failing

## 3.1.0 (2015-12-14)

* Add the ability to specify the path to the PhantomJS binary

## 3.0.1 (2015-11-09)

* Support Node.js 5.x

## 3.0.0 (2015-10-16)

* Initial 3.0 release
* Overhaul the API (now uses Truffler 2.0)
* Drop Node.js 0.10 support
* See the [migration guide](https://github.com/pa11y/pa11y/blob/master/MIGRATION.md#migrating-from-20-to-30) for details

## 2.4.5 (2016-01-05)

* Fix an issue where JSON output was truncated

## 2.4.4 (2015-08-20)

* Handle PhantomJS exits better when a timeout occurs

## 2.4.3 (2015-08-18)

* Add code coverage reporting and increase coverage

## 2.4.2 (2015-08-09)

* Update dependencies
* Increase linter coverage

## 2.4.1 (2015-07-13)

* Add a question about proxying to the README

## 2.4.0 (2015-07-13)

* Add a Markdown reporter
* Update dependencies

## 2.3.0 (2015-06-23)

* Add a `wait` option for pages which take time to fully render
* Relax development dependencies

## 2.2.1 (2015-06-19)

* Update the migration guide

## 2.2.0 (2015-06-18)

* Add the ability to specify a HTML CodeSniffer URL/path
* Make sure that the HTML reporter passes WCAG2AA

## 2.1.0 (2015-06-09)

* Add CSS selectors to the results, making it easier to find elements in the page

## 2.0.2 (2015-06-09)

* Fix a bug caused by PhantomJS stdout

## 2.0.1 (2015-06-08)

* Update dependencies

## 2.0.0 (2015-06-08)

* Initial 2.0 release
* Full rewrite
* See the [migration guide](https://github.com/pa11y/pa11y/blob/master/MIGRATION.md#migrating-from-10-to-20) for details

## 1.7.0 (2015-05-08)

* Add HTML snippets to results for additional context

## 1.6.3 (2015-01-17)

* Fix memory issues by reducing data sent between node and phantom

## 1.6.2 (2014-10-07)

* Documentation updates

## 1.6.1 (2014-06-27)

* Document the viewport option
* Expose the viewport option to the CLI

## 1.6.0 (2014-06-27)

* Output debug messages to `stderr`
* Output debug messages in the JSON/CSV reporters
* Allow configuring viewport width/height

## 1.5.4 (2014-04-30)

* Increase the timeout for functional tests

## 1.5.3 (2014-02-10)

* Add the GPL preamble to all files

## 1.5.2 (2014-01-13)

* Fix a formatting issue which caused files generated by the CSV reporter to display incorrectly in Excel

## 1.5.1 (2013-11-26)

* Set default exit status to -1 to not conflict with error count status codes
* Throw a more helpful error when PhantomJS cannot be found

## 1.5.0 (2013-10-31)

* Allow cookies to be set in-browser, for testing pages which require authentication
* Add "strict mode", where warnings are treated as errors
* Move from Make to Grunt for easier development on Windows
* Full rewrite of the functional tests

## 1.4.3 (2013-10-03)

* Remove instances of `process.exit` from the library

## 1.4.2 (2013-09-10)

* Fix an issue where a premature exit caused the timer to kill the parent process

## 1.4.1 (2013-09-09)

* Fix an issue where HTML CodeSniffer errors can derail Pa11y

## 1.4.0 (2013-08-30)

* Allow users to specify a port to run PhantomJS on. This means you can run multiple Pa11y commands in parallel

## 1.3.0 (2013-08-23)

* Finalise and document the JavaScript API (for non-command-line use)
* Use a custom UserAgent string (pa11y/&lt;version&gt;)
* Allow users to specify their own UserAgent string

## 1.2.1 (2013-08-16)

* Sanitize local HTMLCS URLs for API consistency

## 1.2.0 (2013-07-18)

* Add the ability to ignore certain rules through a JSON config file
* Exit with a non-zero code if any "Error" level messages are present in the results
* Simplify the output of the default console reporter
* Large code overhaul and more complete test suite

## 1.1.0 (2013-07-10)

* Add a CLI option for self-hosted HTML_CodeSniffer
* Fix broken tests on some ISPs

## 1.0.1 (2013-06-26)

* Bug fixes

## 1.0.0 (2013-06-25)

* Test Windows support
* Final config tweaks for stable release

## 1.0.0-beta.3 pre-release (2013-06-24)

* Documentation updates
* Large-scale refactoring and testing

## 1.0.0-beta.2 pre-release (2013-06-11)

* Add a `debug` command line option
* Node 0.10.x support

## 1.0.0-beta.1 pre-release (2013-06-04)

* Initial release

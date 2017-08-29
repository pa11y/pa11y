
Migration Guide
===============

Pa11y's API changes between major versions. This is a guide to help you make the switch when this happens.


Table Of Contents
-----------------

- [Migrating from 4.0 to 5.0](#migrating-from-40-to-50)
- [Migrating from 3.0 to 4.0](#migrating-from-30-to-40)
- [Migrating from 2.0 to 3.0](#migrating-from-20-to-30)
- [Migrating from 1.0 to 2.0](#migrating-from-10-to-20)


Migrating from 4.0 to 5.0
-------------------------

**TODO this migration guide is a work in progress. Please update as you work on Pa11y 5.x**

### PhantomJS to Headless Chrome

Pa11y 5.0 switches from PhantomJS to [Headless Chrome](https://developers.google.com/web/updates/2017/04/headless-chrome). This allows us to use more modern JavaScript APIs and make Pa11y testing more stable.

### Node.js Support

Pa11y 5.0 only supports Node.js v8.0.0 and higher, you'll need to upgrade to be able to use the latest versions of Pa11y.

### Command-Line Interface

The command-line interface in 5.0 is similar to 4.0, but there are a few key changes.

  - The `--verify-page` flag has been removed, as page verification can be achieved with screen-shots or observing the debug output
  - The `--htmlcs` flag has been removed, you can no longer configure the version of HTML CodeSniffer that Pa11y uses (TODO reconsider this)
  - The `--port` flag has been removed, as this is not required to run multiple Headless Chrome instances

### JavaScript Interface

Pa11y is now completely [`Promise`-based](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise), and uses [`async`/`await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) internally. This means the API has changed significantly.

You no longer need to create a separate test function, now Pa11y is just one function: `pa11y(url, options)`. See the [README](README.md) for more information.

### Configuration

Configuration options have had an update between 4.0 and 5.0:

  - The `allowedStandards` option has been removed. This can still be set by manually adding entries to `pa11y.allowedStandards`
  - The `beforeScript` option has been removed in favour of using actions (if the existing actions don't meet your needs, [please let us know](https://github.com/pa11y/pa11y/issues/228))
  - The `htmlcs` option has been removed, you can no longer configure the version of HTML CodeSniffer that Pa11y uses (TODO reconsider this)
  - The `page` option has been removed, as this was specific to PhantomJS. You can set the following options to achieve the same results:
    - `page.headers` can now be set with a new `headers` option
    - `page.settings.userAgent` can now be set with a new `userAgent` option
    - `page.viewport` can now be set with a new `viewport` option
  - The `phantom` option has been removed, as this was specific to PhantomJS
  - The `verifyPage` option has been removed, as page verification can be achieved with screen-shots or by inspecting the `documentTitle` property of the results

### Miscellaneous Changes

  - The default viewport dimensions for Pa11y have been changed from `1024x768` to `1280x1024`
  - The `wait-for-element-state` action no longer has a maximum number of retries – it will retry until Pa11y times out
  - The "multiple-concurrent" example has been removed in favour of a single "multiple" example


Migrating from 3.0 to 4.0
-------------------------

### Node.js Support

The only breaking change in Pa11y 4.0 is that Node.js 0.12 is no longer supported. We'll be using newer ES6 features in upcoming releases which will not work in this older Node.js version.


Migrating from 2.0 to 3.0
-------------------------

### API Overhaul

The Pa11y JavaScript API has been overhauled completely. It would be best to refer to the [usage guide in the README](README.md#usage) as your code will need refactoring.

### Randomized Ports

The `phantom.port` option no longer has a default. If a port is not specified, then Pa11y will bind to an available port. This allows for easier running of tests in parallel, as PhantomJS instances will no longer conflict with each other.

### Node.js Support

Node.js 0.10 is no longer officially supported, Pa11y is unlikely to continue to work with this version going forward.


Migrating from 1.0 to 2.0
-------------------------

### Command-Line Interface

The command-line interface in 2.0 is similar to 1.0, but there are a few key changes.

  - The `console` reporter has been renamed to `cli` and has a different output format
  - The `csv` reporter now includes the message context and selector
  - The `json` reporter now outputs an array which matches the new [output format](#output-format). You can use the [Pa11y JSON 1.0 reporter](https://github.com/pa11y/reporter-1.0-json) to output 1.0-style JSON
  - Reporters no longer handle the way Pa11y exits, this is controlled through the new `--level` flag
  - Custom reporters now have a different API, see the [README](README.md) for more information
  - The file specified by the `--config` flag now expects JSON in a different format. See [configuration](#configuration)
  - The `--htmlcs` flag shorthand has been changed to `-H`
  - The `--useragent` flag has been removed, this is now managed through the config file
  - The `--viewport` flag has been removed, this is now managed through the config file
  - The `--strict` flag has been removed, this is controlled through the new `--level` flag
  - HTML CodeSniffer is now loaded from a local file by default so tests can be run offline

### JavaScript Interface

A two-step running process is now used over a single `pa11y.sniff()` function. This allows a single PhantomJS browser to run multiple tests, reducing memory usage and making Pa11y more useful to derivative tools. See the [README](README.md) for more information.

### Output Format

Results in Pa11y 2.0 are no longer output as an object, instead only the results array is provided. It's up to your code (or reporter) to add totals etc. Also the result format has been changed:

```js
// 1.0 result
{
  code: 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2',
  message: 'Check that the title element describes the document.',
  type: 'notice',
  html: '<title>Pa11y - Your automated accessib...</title>'
}

// 2.0 result
{
    code: 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2',
    context: '<title>Pa11y - Your automated accessib...</title>',
    message: 'Check that the title element describes the document.',
    selector: 'html > head > title',
    type: 'notice',
    typeCode: 3
}
```

### Configuration

Configuration options have had a big overhaul between 1.0 and 2.0:

  - The `url` option has been removed. See [JavaScript Interface](#javascript-interface) for more information
  - The `config` option has been removed. Cookies are now set as in the `page.headers` option. Ignored rules are now set in a new `ignore` option
  - The `ignore` option now accepts message types (error, warning, notice) as well as codes
  - The `useragent` option has been removed, it can now be set in the `page.headers` option
  - The `port` option has been removed, it can now be set in the `phantom.port` option
  - The `viewport` option has been removed, it can now be set in the `page.viewport` option
  - The `debug` option has been removed, debugging is now handled by the `log.debug` option which expects a function

### Contributing/Testing

Pa11y 2.0 uses Make over Grunt as a build tool. For Windows users, all of the Make targets should be runnable individually by copying commands from the Makefile and running within a terminal.

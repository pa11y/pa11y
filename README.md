# Pa11y

Pa11y is your automated accessibility testing pal. It runs accessibility tests on your pages via the command line or Node.js, so you can automate your testing process.

[![NPM version][shield-npm]][info-npm]
[![Node.js version support][shield-node]][info-node]
[![Build status][shield-build]][info-build]
[![LGPL-3.0-only licensed][shield-license]][info-license]

On the command line:

```sh
pa11y https://example.com
```

In JavaScript:

```js
const pa11y = require('pa11y');

pa11y('https://example.com').then((results) => {
    // Use the results
});
```

## Requirements

Pa11y 9 requires [Node.js][node] 20, 22, or 24. An older version of Node.js can be used with [Pa11y 8 or below](#support-and-migration).

### Linux and macOS

To install [Node.js][node] you can use [nvm][nvm]. For example, to install with `nvm` with [Homebrew][brew], and then install the latest version of Node:

```sh
brew install nvm
nvm install node
nvm install-latest-npm
```

Alternatively, download a pre-built package from the [Node.js][node] website for your operating system.

### Windows

On Windows 10, download a pre-built package from the [Node.js][node] website. Pa11y will be usable via the bundled Node.js application as well as the Windows command prompt.

## Command-line interface

Install Pa11y globally with [npm][npm]:

```sh
npm install -g pa11y
```

```console
$ pa11y --help

Usage: pa11y [options] <url>

  Options:

    -V, --version                  output the version number
    -n, --environment              output details about the environment Pa11y will run in
    -s, --standard <name>          the accessibility standard to use: WCAG2A, WCAG2AA (default), WCAG2AAA – only used by htmlcs runner
    -r, --reporter <reporter>      the reporter to use: cli (default), csv, json
    -e, --runner <runner>          the test runners to use: htmlcs (default), axe
    -l, --level <level>            the level of issue to fail on (exit with code 2): error, warning, notice
    -T, --threshold <number>       permit this number of errors, warnings, or notices, otherwise fail with exit code 2
    -i, --ignore <ignore>          types and codes of issues to ignore, a repeatable value or separated by semi-colons
    --include-notices              Include notices in the report
    --include-warnings             Include warnings in the report
    -R, --root-element <selector>  a CSS selector used to limit which part of a page is tested
    -E, --hide-elements <hide>     a CSS selector to hide elements from testing, selectors can be comma separated
    -c, --config <path>            a JSON or JavaScript config file
    -t, --timeout <ms>             the timeout in milliseconds
    -w, --wait <ms>                the time to wait before running tests in milliseconds
    -d, --debug                    output debug messages
    -S, --screen-capture <path>    a path to save a screen capture of the page to
    -A, --add-rule <rule>          WCAG 2.1 rules to include, a repeatable value or separated by semi-colons – only used by htmlcs runner
    -h, --help                     output usage information
```

### Testing with `pa11y`

Find accessibility issues at a URL:

```sh
pa11y https://example.com
```

The default [test runner](#runners) is [HTML_CodeSniffer][htmlcs], but [axe] is also supported. To use `axe`:

```sh
pa11y https://example.com --runner axe
```

Use both axe and HTML_CodeSniffer in the same run:

```sh
pa11y https://example.com --runner axe --runner htmlcs
```

Generate results in CSV format, and output to a file, `report.csv`:

```sh
pa11y https://example.com > report.csv --reporter csv 
```

Find accessibility issues in a local HTML file (absolute paths only, not relative):

```sh
pa11y ./path/to/your/file.html
```

### Exit codes

The command-line tool uses the following exit codes:

- `0`: Pa11y ran successfully, and there are no errors
- `1`: Pa11y failed run due to a technical fault
- `2`: Pa11y ran successfully but there are errors in the page

By default, only accessibility issues with a type of `error` will exit with a code of `2`. This is configurable with the `--level` flag which can be set to one of the following:

- `error`: exit with a code of `2` on errors only, exit with a code of `0` on warnings and notices
- `warning`: exit with a code of `2` on errors and warnings, exit with a code of `0` on notices
- `notice`: exit with a code of `2` on errors, warnings, and notices
- `none`: always exit with a code of `0`

### Command-line configuration

The command-line tool can be configured with a JSON file as well as arguments. By default it will look for a `pa11y.json` file in the current directory, but you can change this with the `--config` flag:

```sh
pa11y https://example.com --config ./path/to/config.json 
```

If any configuration is set both in a configuration file and also as a command-line option, the value set in the latter will take priority.

For more information on configuring Pa11y, see the [configuration documentation](#configuration).

### Ignoring

The ignore flag can be used in several different ways. Separated by semi-colons:

```sh
pa11y https://example.com --ignore "issue-code-1;issue-code-2" 
```

or by using the flag multiple times:

```sh
pa11y https://example.com --ignore issue-code-1 --ignore issue-code-2 
```

Pa11y can also ignore notices, warnings, and errors up to a threshold number. This might be useful if you're using CI and don't want to break your build. The following example will return exit code 0 on a page with 9 errors, and return exit code 2 on a page with 10 or more errors.

```sh
pa11y https://example.com --threshold 10 
```

### Reporters

The command-line tool can provide test results in a few different ways using the `--reporter` flag. The built-in reporters are:

- `cli`: output test results in a human-readable format
- `csv`: output test results as comma-separated values
- `html`: output test results as an HTML page
- `json`: output test results as a JSON array
- `tsv`: output test results as tab-separated values

You can also write and publish your own reporters. Pa11y looks for reporters in your `node_modules` folder (with a naming pattern), and the current working directory. The first reporter found will be loaded. So with this command:

```sh
pa11y https://example.com --reporter rainbows 
```

The following locations will be checked:

```sh
<cwd>/node_modules/pa11y-reporter-rainbows
<cwd>/rainbows
```

A Pa11y reporter _must_ export a string property named `supports`. This is a [semver range] which indicates which versions of Pa11y the reporter supports:

```js
exports.supports = '^8.0.0';
```

A reporter should export the following methods, each returning one string. If your reporter needs to perform asynchronous operations, then it may return a promise which resolves to a string:

```js
begin(); // Called when pa11y starts
error(message); // Called when a technical error is reported
debug(message); // Called when a debug message is reported
info(message); // Called when an information message is reported
results(results); // Called with a test run's results
```

## JavaScript interface

Add Pa11y to your project with [npm][npm], most commonly as a development dependency:

```sh
npm install pa11y --save-dev
```

Require Pa11y:

```js
const pa11y = require('pa11y');
```

Run Pa11y against a URL, the `pa11y` function returns a [Promise]:

```js
pa11y(url).then((results) => {
    // Use the results
});
```

Pa11y can also be run with [options](#configuration):

```js
const options = { /* ... */ };
pa11y(url, options)).then((results) => {
    // Use the results
});
```

Pa11y resolves with a `results` object, containing details about the page, and an array of accessibility issues found by the test runner:

```js
{
    pageUrl: 'The tested URL',
    documentTitle: 'Title of the page under test',
    issues: [
        {
            code: 'WCAG2AA.Principle1.Guideline1_1.1_1_1.H30.2',
            context: '<a href="https://example.com/"><img src="example.jpg" alt=""/></a>',
            message: 'Img element is the only content of the link, but is missing alt text. The alt text should describe the purpose of the link.',
            selector: 'html > body > p:nth-child(1) > a',
            type: 'error',
            typeCode: 1
        }
    ]
}
```

### Transforming the results

If you wish to transform these results with a command-line reporter, `require` it into your code. The `csv`, `tsv`, `html`, `json`, and `markdown` reporters each expose a method `process`:

```js
// Assuming you've already run tests, and the results
// are available in a `results` variable:
const htmlReporter = require('pa11y/lib/reporters/html');
const html = await htmlReporter.results(results);
```

### `async`/`await`

Pa11y uses promises, so you can use `async` functions and the `await` keyword:

```js
async function runPa11y() {
    try {
        const results = await pa11y(url);
        // Use the results
    }
    catch (error) {
        // Handle error
    }
}

runPa11y();
```

### Callback interface

For those who prefer callbacks to promises:

```js
pa11y(url, (error, results) => {
    // Use results, handle error
});
```

### Validating actions

Pa11y's `isValidAction` function can be used to validate an [action](#actions) string ahead of its use:

```js
pa11y.isValidAction('click element #submit');  // true
pa11y.isValidAction('open the pod bay doors'); // false
```

## Configuration

Pa11y has lots of options you can use to change the way Headless Chrome runs, or the way your page is loaded. Options can be set either as a parameter on the `pa11y` function or in a [JSON configuration file](#command-line-configuration). Some are also available directly as [command-line options](#command-line-interface).

Below is a reference of all the options that are available:

### `actions` (array)

Actions to be run before Pa11y tests the page. There are quite a few different actions available in Pa11y, the [Actions documentation](#actions) outlines each of them.

```js
pa11y(url, {
    actions: [
        'set field #username to exampleUser',
        'set field #password to password1234',
        'click element #submit',
        'wait for path to be /myaccount'
    ]
});
```

Defaults to an empty array.

### `browser` (Browser) and `page` (Page)

A [Puppeteer Browser instance][puppeteer-browser] which will be used in the test run. Optionally you may also supply a [Puppeteer Page instance][puppeteer-page], but this cannot be used between test runs as event listeners would be bound multiple times.

If either of these options are provided then there are several things you need to consider:

  1. Pa11y's `chromeLaunchConfig` option will be ignored, you'll need to pass this configuration in when you create your Browser instance
  2. Pa11y will not automatically close the Browser when the tests have finished running, you will need to do this yourself if you need the Node.js process to exit
  3. It's important that you use a version of Puppeteer that meets the range specified in Pa11y's `package.json`
  4. You _cannot_ reuse page instances between multiple test runs, doing so will result in an error. The page option allows you to do things like take screen-shots on a Pa11y failure or execute your own JavaScript before Pa11y

**Note:** This is an advanced option. If you're using this, please mention in any issues you open on Pa11y and double-check that the Puppeteer version you're using matches Pa11y's.

```js
const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true
});

pa11y(url, {
    browser: browser
});

browser.close();
```

A more complete example can be found in the [puppeteer examples](#puppeteer-example).

Defaults to `null`.

### `chromeLaunchConfig` (object)

Launch options for the Headless Chrome instance. [See the Puppeteer documentation for more information][puppeteer-launch].

```js
pa11y(url, {
    chromeLaunchConfig: {
        executablePath: '/path/to/Chrome',
        ignoreHTTPSErrors: false
    }
});
```

Defaults to:

```js
{
    ignoreHTTPSErrors: true
}
```

### `headers` (object)

A key-value map of request headers to send when testing a web page.

```js
pa11y(url, {
    headers: {
        Cookie: 'foo=bar'
    }
});
```

Defaults to an empty object.

### `hideElements` (string)

A CSS selector to hide elements from testing, selectors can be comma separated. Elements matching this selector will be hidden from testing by styling them with `visibility: hidden`.

```js
pa11y(url, {
    hideElements: '.advert, #modal, div[aria-role=presentation]'
});
```

### `ignore` (array)

An array of result codes and types that you'd like to ignore. You can find the codes for each rule in the console output and the types are `error`, `warning`, and `notice`. Note: `warning` and `notice` messages are ignored by default.

```js
pa11y(url, {
    ignore: [
        'WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2'
    ]
});
```

Defaults to an empty array.

### `ignoreUrl` (boolean)

Whether to use the provided [Puppeteer Page instance][puppeteer-page] as is or use the provided url. Both the [Puppeteer Page instance][puppeteer-page] and the [Puppeteer Browser instance][puppeteer-browser] are required alongside `ignoreUrl`.

```js
const browser = await puppeteer.launch();
const page = await browser.newPage();

pa11y(url, {
    ignoreUrl: true,
    page: page,
    browser: browser
});
```

Defaults to `false`.

### `includeNotices` (boolean)

Whether to include results with a type of `notice` in the Pa11y report. Issues with a type of `notice` are not directly actionable and so they are excluded by default. You can include them by using this option:

```js
pa11y(url, {
    includeNotices: true
});
```

Defaults to `false`.

### `includeWarnings` (boolean)

Whether to include results with a type of `warning` in the Pa11y report. Issues with a type of `warning` are not directly actionable and so they are excluded by default. You can include them by using this option:

```js
pa11y(url, {
    includeWarnings: true
});
```

Defaults to `false`.

### `level` (string)

The level of issue which can fail the test (and cause it to exit with code 2) when running via the CLI. This should be one of `error` (the default), `warning`, or `notice`.

```json
{
    "level": "warning"
}
```

Defaults to `error`. Note this configuration is only available when using Pa11y on the command line, not via the JavaScript Interface.

### `log` (object)

An object which implements the methods `debug`, `error`, and `info` which will be used to report errors and test information.

```js
pa11y(url, {
    log: {
        debug: console.log,
        error: console.error,
        info: console.info
    }
});
```

Each of these defaults to an empty function.

### `method` (string)

The HTTP method to use when running Pa11y.

```js
pa11y(url, {
    method: 'POST'
});
```

Defaults to `GET`.

### `postData` (string)

The HTTP POST data to send when running Pa11y. This should be combined with a `Content-Type` header. E.g to send form data:

```js
pa11y(url, {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    postData: 'foo=bar&bar=baz'
});
```

Or to send JSON data:

```js
pa11y(url, {
    headers: {
        'Content-Type': 'application/json'
    },
    method: 'POST',
    postData: '{"foo": "bar", "bar": "baz"}'
});
```

Defaults to `null`.

### `reporter` (string)

The reporter to use while running the test via the CLI. [More about reporters](#reporters).

```json
{
    "reporter": "json"
}
```

Defaults to `cli`. Note this configuration is only available when using Pa11y on the command line, not via the JavaScript Interface.

### `rootElement` (element)

The root element for testing a subset of the page opposed to the full document.

```js
pa11y(url, {
    rootElement: '#main'
});
```

Defaults to `null`, meaning the full document will be tested. If the specified root element isn't found, the full document will be tested.

### `runners` (array)

An array of runner names which correspond to existing and installed [Pa11y runners](#runners). If a runner is not found then Pa11y will error.

```js
pa11y(url, {
    runners: [
        'axe',
        'htmlcs'
    ]
});
```

Defaults to:

```js
[
    'htmlcs'
]
```

### `rules` (array)

An array of WCAG 2.1 guidelines that you'd like to include to the current standard. You can find the codes for each guideline in the [HTML Code Sniffer WCAG2AAA ruleset][htmlcs-wcag2aaa-ruleset]. **Note:** only used by htmlcs runner.

```js
pa11y(url, {
    rules: [
        'Principle1.Guideline1_3.1_3_1_AAA'
    ]
});
```

### `screenCapture` (string)

A file path to save a screen capture of the tested page to. The screen will be captured immediately after the Pa11y tests have run so that you can verify that the expected page was tested.

```js
pa11y(url, {
    screenCapture: `${__dirname}/my-screen-capture.png`
});
```

Defaults to `null`, meaning the screen will not be captured. Note the directory part of this path must be an existing directory in the file system – Pa11y will not create this for you.

### `standard` (string)

The accessibility standard to use when testing pages. This should be one of `WCAG2A`, `WCAG2AA`, or `WCAG2AAA`. **Note:** only used by htmlcs runner.

```js
pa11y(url, {
    standard: 'WCAG2A'
});
```

Defaults to `WCAG2AA`.

### `threshold` (number)

The number of errors, warnings, or notices to permit before the test is considered to have failed (with exit code 2) when running via the CLI.

```json
{
    "threshold": 9
}
```

Defaults to `0`. Note this configuration is only available when using Pa11y on the command line, not via the JavaScript Interface.

### `timeout` (number)

The time in milliseconds that a test should be allowed to run before calling back with a timeout error.

Please note that this is the timeout for the _entire_ test run (including time to initialise Chrome, load the page, and run the tests).

```js
pa11y(url, {
    timeout: 500
});
```

Defaults to `30000`.

### `userAgent` (string)

The `User-Agent` header to send with Pa11y requests. This is helpful to identify Pa11y in your logs.

```js
pa11y(url, {
    userAgent: 'A11Y TESTS'
});
```

Defaults to `pa11y/<version>`.

### `viewport` (object)

The viewport configuration. This can have any of the properties supported by the [puppeteer `setViewport` method][puppeteer-viewport].

```js
pa11y(url, {
    viewport: {
        width: 320,
        height: 480,
        deviceScaleFactor: 2,
        isMobile: true
    }
});
```

Defaults to:

```js
{
    width: 1280,
    height: 1024
}
```

### `wait` (number)

The time in milliseconds to wait before running HTML_CodeSniffer on the page.

```js
pa11y(url, {
    wait: 500
});
```

Defaults to `0`.

## Actions

Actions are additional interactions that you can make Pa11y perform before the tests are run. They allow you to do things like click on a button, enter a value in a form, wait for a redirect, or wait for the URL fragment to change:

```js
pa11y(url, {
    actions: [
        'click element #tab-1',
        'wait for element #tab-1-content to be visible',
        'set field #fullname to John Doe',
        'clear field #middlename',
        'check field #terms-and-conditions',
        'uncheck field #subscribe-to-marketing',
        'screen capture example.png',
        'wait for fragment to be #page-2',
        'wait for path to not be /login',
        'wait for url to be https://example.com/',
        'wait for #my-image to emit load',
        'navigate to https://another-example.com/'
    ]
});
```

Below is a reference of all the available actions and what they do on the page. Some of these take time to complete so you may need to increase the `timeout` option if you have a large set of actions.

### `click element <selector>`

Clicks an element:

```js
pa11y(url, {
    actions: [
        'click element #tab-1'
    ]
});
```

You can use any valid [query selector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector), including classes and types.

### `set field <selector> to <value>`

Sets the value of a text-based `input` or `select`:

```js
pa11y(url, {
    actions: [
        'set field #fullname to John Doe'
    ]
});
```

### `clear field <selector>`

Clears the value of a text-based `input` or `select`:

```js
pa11y(url, {
    actions: [
        'clear field #middlename'
    ]
});
```

### `check field <selector>`, `uncheck field <selector>`

Checks/unchecks an `input` of type `radio` or `checkbox`:

```js
pa11y(url, {
    actions: [
        'check field #terms-and-conditions',
        'uncheck field #subscribe-to-marketing'
    ]
});
```

### `screen capture <to-file-path.png>`

Captures the screen, saving the image to a file, which can be useful between actions for debugging, or just for visual reassurance:

```js
pa11y(url, {
    actions: [
        'screen capture example.png'
    ]
});
```

### `wait for`

#### `wait for <fragment|path|url>`

This allows you to pause the test until a condition is met, and the page has either a given fragment, path, or URL. This will wait until Pa11y times out so it should be used after another action that would trigger the change in state. You can also wait until the page does **not** have a given fragment, path, or URL using the `to not be` syntax. This action takes one of the forms:

- `wait for fragment to be <fragment>` (including the preceding `#`)
- `wait for fragment to not be <fragment>` (including the preceding `#`)
- `wait for path to be <path>` (including the preceding `/`)
- `wait for path to not be <path>` (including the preceding `/`)
- `wait for url to be <url>`
- `wait for url to not be <url>`

E.g.

```js
pa11y(url, {
    actions: [
        'click element #login-link',
        'wait for path to be /login'
    ]
});
```

#### `wait for element`'s state

This allows you to pause the test until an element on the page (matching a CSS selector) is either added, removed, visible, or hidden. This will wait until Pa11y times out so it should be used after another action that would trigger the change in state. This action takes one of the forms:

- `wait for element <selector> to be added`
- `wait for element <selector> to be removed`
- `wait for element <selector> to be visible`
- `wait for element <selector> to be hidden`

E.g.

```js
pa11y(url, {
    actions: [
        'click element #tab-2',
        'wait for element #tab-1 to be hidden'
    ]
});
```

#### `wait for element`'s event

This allows you to pause the test until an element on the page (matching a CSS selector) emits an event. This will wait until Pa11y times out so it should be used after another action that would trigger the event. This action takes the form `wait for element <selector> to emit <event-type>`. E.g.

```js
pa11y(url, {
    actions: [
        'click element #tab-2',
        'wait for element #tab-panel-to to emit content-loaded'
    ]
});
```

### `navigate to <url>`

This action allows you to navigate to a new URL if, for example, the URL is inaccessible using other methods. This action takes the form `navigate to <url>`. E.g.

```js
pa11y(url, {
    actions: [
        'navigate to https://another-example.com'
    ]
});
```

## Runners

Pa11y supports multiple test runners which return different results. The built-in options are:

- `axe`: run tests using [axe-core][axe].
- `htmlcs` (default): run tests using [HTML_CodeSniffer][htmlcs]

You can also write and publish your own runners. Pa11y looks for runners in your `node_modules` folder (with a naming pattern), and the current working directory. The first runner found will be loaded. So with this command:

```sh
pa11y https://example.com --runner custom-tool
```

The following locations will be checked:

```sh
<cwd>/node_modules/pa11y-runner-custom-tool
<cwd>/node_modules/custom-tool
<cwd>/custom-tool
```

A Pa11y runner _must_ export a string property named `supports`. This is a [semver range] which indicates which versions of Pa11y the runner supports:

```js
exports.supports = '^8.0.0';
```

A Pa11y runner _must_ export a property named `scripts`. This is an array of strings which are paths to scripts which need to load before the tests can be run. This may be empty:

```js
exports.scripts = [
    `${__dirname}/vendor/example.js`
];
```

A runner _must_ export a `run` method, which returns a promise that resolves with test results (it's advisable to use an `async` function). The `run` method is evaluated in a browser context and so has access to a global `window` object.

The `run` method _must not_ use anything that's been imported using `require`, as it's run in a browser context. Doing so will error.

The `run` method is called with two arguments:

- `options`: Options specified in the test runner
- `pa11y`: The Pa11y test runner, which includes some helper methods:
  - `pa11y.getElementContext(element)`: Get a short HTML context snippet for an element
  - `pa11y.getElementSelector(element)`: Get a unique selector with which you can select this element in a page

The `run` method _must_ resolve with an array of Pa11y issues. These follow the format:

```js
{
    code: '123', // An identifier for this error
    element: {}, // The HTML element this issue relates to; `null` if no element is involved
    message: 'example', // A description of the issue
    type: 'error', // 'error', 'warning', or 'notice'
    runnerExtras: {} // Additional data a runner is free to provide; unused by Pa11y itself
}
```

## Examples

### Basic example

Run Pa11y on a URL and output the results. [See the example](example/basic/index.js).

### Multiple URLs example

Run Pa11y on multiple URLs at once and output the results. [See the example](example/multiple/index.js).

### Actions example

Step through some actions before Pa11y runs. This example logs into a fictional site then waits until the account page has loaded before running Pa11y. [See the example](example/actions/index.js).

### Puppeteer example

Pass in pre-created Puppeteer browser and page instances so that you can reuse them between tests. [See the example](example/puppeteer/index.js).

## Common questions and troubleshooting

See our [Troubleshooting guide](TROUBLESHOOTING.md) to get the answers to common questions about Pa11y, along with some ideas to help you troubleshoot any problems.

## Tutorials and articles

You can find some useful tutorials and articles in the [Tutorials section](https://pa11y.org/tutorials/) of [pa11y.org](https://pa11y.org/).

## Contributing

There are many ways to contribute to Pa11y, some of which we describe in the [contributing guide](CONTRIBUTING.md) for this repo.

If you're ready to contribute some code, clone this repo, commit your code to a new branch, then create a pull request to bring your changes into `main`. If you're an external contributor, [fork this repo][fork-pa11y] first, then follow the same process.

Please write unit tests for your code, and check that everything works by running the following before opening a pull request:

```sh
npm run lint                # Lint the code
npm test                    # Run every test, reporting coverage
```

You can also run test suites individually:

```sh
npm run test-unit           # Run the unit tests alone
npm run test-integration    # Run the integration tests alone
npm run test-coverage       # Run the unit tests alone, reporting coverage
```

## Support and migration

> [!TIP]
> We maintain a [migration guide](MIGRATION.md) to help you migrate between major versions.

When we release a new major version we will continue to support the previous major version for 6 months. This support will be limited to fixes for critical bugs and security issues. If you're opening an issue related to this project, please mention the specific version that the issue affects.

The following table lists the major versions available and, for each previous major version, its end-of-support date, and its final minor version released.

| Major version | Final minor version | Node.js support  | Puppeteer version | Support end date         |
| :------------ | :------------------ | :--------------- | :---------------- | :----------------------- |
| `9`           |                     | `20`, `22`, `24` | `^24`             | ✅ Current major version |
| `8`           | `8.0`               | `18`, `20`, `22` | `^22`             | 2025-11-07               |
| `7`           | `7.0`               | `18`, `20`       | `^20`             | 2024-10-02               |
| `6`           | `6.2`               | `12`, `14`, `16` | `~9.1`            | 2024-07-16               |
| `5`           | `5.3`               | `8`, `10`, `12`  | `^1`              | 2021-11-25               |
| `4`           | `4.13`              | `4`, `6`, `8`    |                   | 2018-08-15               |
| `3`           | `3.8`               | `0.12`, `4`      |                   | 2016-12-05               |
| `2`           | `2.4`               | `0.10`, `0.12`   |                   | 2016-10-16               |
| `1`           | `1.7`               | `0.10`           |                   | 2016-06-08               |

## License

Pa11y is licensed under the [Lesser General Public License (LGPL-3.0-only)][info-license].  
Copyright &copy; 2013-2024, Team Pa11y and contributors

[axe]: https://www.deque.com/axe/
[brew]: https://mxcl.github.com/homebrew/
[fork-pa11y]: (https://github.com/pa11y/pa11y/fork)
[htmlcs-wcag2aaa-ruleset]: https://squizlabs.github.io/HTML_CodeSniffer/Standards/WCAG2/
[htmlcs]: https://squizlabs.github.io/HTML_CodeSniffer/
[info-build]: https://github.com/pa11y/pa11y/actions/workflows/tests.yml
[info-license]: LICENSE
[info-node]: package.json
[info-npm]: https://www.npmjs.com/package/pa11y
[node]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[nvm]: https://github.com/nvm-sh/nvm
[promise]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
[puppeteer-browser]: https://pptr.dev/api/puppeteer.browser
[puppeteer-launch]: https://pptr.dev/api/puppeteer.launchoptions
[puppeteer-page]: https://pptr.dev/api/puppeteer.page
[puppeteer-viewport]: https://pptr.dev/api/puppeteer.page.setviewport
[semver range]: https://github.com/npm/node-semver#ranges
[shield-build]: https://github.com/pa11y/pa11y/actions/workflows/tests.yml/badge.svg
[shield-license]: https://img.shields.io/badge/license-LGPL%203.0-blue.svg
[shield-node]: https://img.shields.io/node/v/pa11y.svg
[shield-npm]: https://img.shields.io/npm/v/pa11y.svg

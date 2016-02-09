
pa11y
=====

pa11y is your automated accessibility testing pal. It runs [HTML CodeSniffer][sniff] from the command line for programmatic accessibility reporting.

[![NPM version][shield-npm]][info-npm]
[![Node.js version support][shield-node]][info-node]
[![Build status][shield-build]][info-build]
[![Dependencies][shield-dependencies]][info-dependencies]
[![LGPL-3.0 licensed][shield-license]][info-license]

On the command line:

```sh
pa11y nature.com
```

In JavaScript:

```js
var pa11y = require('pa11y');

var test = pa11y(options);

test.run('nature.com', function (error, results) {
    /* ... */
});
```


Table Of Contents
-----------------

- [Requirements](#requirements)
- [Command-Line Interface](#command-line-interface)
- [JavaScript Interface](#javascript-interface)
- [Configuration](#configuration)
- [Examples](#examples)
- [Common Questions](#common-questions)
- [Contributing](#contributing)
- [Migrating](#migrating)
- [License](#license)


Requirements
------------

pa11y requires [Node.js][node] 0.12+ and [PhantomJS][phantom] to run.

### OS X

On a Mac, you can install the required dependencies with [Homebrew][brew]:

```sh
$ brew install node
$ brew install phantomjs
```

Alternatively download pre-built packages from the [Node.js][node] and [PhantomJS][phantom] websites.

### Linux

Depending on your flavour of Linux, you should be able to use a package manager to install the required dependencies. Alternatively download pre-built packages from the [Node.js][node] and [PhantomJS][phantom] websites.

### Windows

Windows users approach with caution – we've been able to get pa11y running (Windows 7, Node 0.12) but only after installing Visual Studio and the Windows SDK (as well as Git, Python and PhantomJS). The [Windows installation instructions for node-gyp][windows-install] are a good place to start.

If you run into following error:

```
Error: spawn phantomjs ENOENT
    at exports._errnoException (util.js:874:11)
    at Process.ChildProcess._handle.onexit (internal/child_process.js:178:32)
    at onErrorNT (internal/child_process.js:344:16)
    at doNTCallback2 (node.js:439:9)
    at process._tickCallback (node.js:353:17)
    at Function.Module.runMain (module.js:469:11)
    at startup (node.js:134:18)
    at node.js:961:3
```

follow these steps:

1. Install PhantomJS@v2.0 via [npm][npm]
   ```
   npm install -g phantomjs2
   ```

2. Navigate to `%APPDATA%\AppData\Roaming\npm\node_modules\phantomjs2\lib\phantom\bin` and copy `phantomjs.exe` to `%APPDATA%\AppData\Roaming\npm\`


Command-Line Interface
----------------------

Install pa11y globally with [npm][npm]:

```
npm install -g pa11y
```

This installs the `pa11y` command-line tool:

```
Usage: pa11y [options] <url>

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -s, --standard <name>      the accessibility standard to use: Section508, WCAG2A, WCAG2AA (default), WCAG2AAA
    -r, --reporter <reporter>  the reporter to use: cli (default), csv, html, json
    -l, --level <level>        the level of message to fail on (exit with code 2): error, warning, notice
    -T, --threshold <name>     the number of individual errors, warnings, or notices to permit before failing
    -i, --ignore <ignore>      types and codes of messages to ignore, a repeatable value or separated by semi-colons
    -c, --config <path>        a JSON or JavaScript config file
    -p, --port <port>          the port to run PhantomJS on
    -t, --timeout <ms>         the timeout in milliseconds
    -w, --wait <ms>            the time to wait before running tests in milliseconds
    -d, --debug                output debug messages
    -H, --htmlcs <url/path>    the URL or path to source HTML_CodeSniffer from
    -e, --phantomjs <path>     the path to the phantomjs executable
```

### Running Tests

Run an accessibility test against a URL:

```
pa11y nature.com
```

Run an accessibility test against a file:

```
pa11y file:///path/to/your/file.html
```

Run a test with CSV reporting and save to a file:

```
pa11y --reporter csv nature.com > report.csv
```

Run pa11y with the Section508 ruleset:

```
pa11y --standard Section508 nature.com
```

### Exit Codes

The command-line tool uses the following exit codes:

  - `0`: pa11y ran successfully, and there are no errors
  - `1`: pa11y failed run due to a technical fault
  - `2`: pa11y ran successfully but there are errors in the page

By default, only accessibility issues with a type of `error` will exit with a code of `2`. This is configurable with the `--level` flag which can be set to one of the following:

  - `error`: exit with a code of `2` on errors only, exit with a code of `0` on warnings and notices
  - `warning`: exit with a code of `2` on errors and warnings, exit with a code of `0` on notices
  - `notice`: exit with a code of `2` on errors, warnings, and notices
  - `none`: always exit with a code of `0`

### Command-Line Configuration

The command-line tool can be configured with a JSON file as well as arguments. By default it will look for a `pa11y.json` file in the current directory, but you can change this with the `--config` flag:

```
pa11y --config ./path/to/config.json nature.com
```

For more information on configuring pa11y, see the [configuration documentation](#configuration).

### Ignoring

The ignore flag can be used in several different ways. Seperated by semi-colons:

```
pa11y --ignore "warning;notice" nature.com
```

or by using the flag mutiple times:

```
pa11y --ignore warning --ignore notice nature.com
```

### Reporters

The command-line tool can report test results in a few different ways using the `--reporter` flag. The built-in reporters are:

  - `cli`: output test results in a human-readable format
  - `csv`: output test results as comma-separated values
  - `html`: output test results as an HTML document
  - `json`: output test results as a JSON array
  - `markdown`: output test results as a Markdown document

You can also write and publish your own reporters. Pa11y looks for reporters in the core library, your `node_modules` folder (with a naming pattern), and the current working directory. The first reporter found will be loaded. So with this command:

```
pa11y --reporter rainbows nature.com
```

The following locations will be checked:

```
<pa11y-core>/reporter/rainbows
<cwd>/node_modules/pa11y-reporter-rainbows
<cwd>/rainbows
```

A pa11y reporter should export the following methods:

```js
begin(url); // Called when pa11y starts
error(message); // Called when a technical error is reported
debug(message); // Called when a debug message is reported
info(message); // Called when an information message is reported
results(resultsArray, url); // Called with the results of a test run
```

You may find the following reporters useful:

  - [`1.0-json`][1.0-json-reporter]: output test results in the pa11y 1.0 JSON format


JavaScript Interface
--------------------

Install pa11y with [npm][npm] or add to your `package.json`:

```
npm install pa11y
```

Require pa11y:

```js
var pa11y = require('pa11y');
```

Create a tester by initialising pa11y with [some options](#configuration):

```js
var test = pa11y(options);
```

The `test.run` function can then be used to run your test function against a URL:

```js
test.run('http://www.nature.com/', function(error, results) {
    // ...
});
```

The results that get passed into your test callback come from HTML CodeSniffer, and look like this:

```js
[
    {
        code: 'WCAG2AA.Principle1.Guideline1_1.1_1_1.H30.2',
        context: '<a href="http://example.com/"><img src="example.jpg" alt=""/></a>',
        message: 'Img element is the only content of the link, but is missing alt text. The alt text should describe the purpose of the link.',
        selector: 'html > body > p:nth-child(1) > a',
        type: 'error',
        typeCode: 1
    },
    {
        code: 'WCAG2AA.Principle1.Guideline1_3.1_3_1.H49.B',
        context: '<b>Hello World!</b>',
        message: 'Semantic markup should be used to mark emphasised or special text so that it can be programmatically determined.',
        selector: '#content > b:nth-child(4)',
        type: 'warning',
        typeCode: 2
    },
    {
        code: 'WCAG2AA.Principle2.Guideline2_4.2_4_4.H77,H78,H79,H80,H81',
        context: '<a href="http://example.com/">Hello World!</a>',
        message: 'Check that the link text combined with programmatically determined link context identifies the purpose of the link.',
        selector: 'html > body > ul > li:nth-child(2) > a',
        type: 'notice',
        typeCode: 3
    }
]
```


Configuration
-------------

pa11y has lots of options you can use to change the way PhantomJS runs, or the way your page is loaded. Options can be set either on the pa11y instance when it's created or the individual test runs. This allows you to set some defaults which can be overridden per-test:

```js
// Set the default Foo header to "bar"
var test = pa11y({
    page: {
        headers: {
            Foo: 'bar'
        }
    }
});

// Run a test with the Foo header set to "bar"
test.run('http://www.nature.com/', function(error, results) { /* ... */ });

// Run a test with the Foo header overridden
test.run('http://www.nature.com/', {
    page: {
        headers: {
            Foo: 'hello'
        }
    }
}, function(error, results) { /* ... */ });
```

Below is a reference of all the options that are available:

### `allowedStandards` (array)

The accessibility standards that are allowed to be used. This can be modified to allow for custom HTML CodeSniffer standards.

```js
pa11y({
    allowedStandards: ['WCAG2AA', 'My Custom Standard']
});
```

Defaults to `Section508`, `WCAG2A`, `WCAG2AA`, and `WCAG2AAA`.

### `beforeScript` (function)

A function to be run before pa11y tests the page. The function accepts three parameters;

- `page` is the phantomjs page object, [documentation for the phantom bridge can be found here][phantom-node-options]
- `options` is the finished options object used to configure pa11y
- `next` is a callback function

```js
pa11y({
    beforeScript: function(page, options, next) {
		// Make changes to the page
		// When finished call next to continue running pa11y tests
		next();
	}
});
```

Defaults to `null`.

### `htmlcs` (string)

The path or URL to source HTML CodeSniffer from.

```js
pa11y({
    htmlcs: 'http://squizlabs.github.io/HTML_CodeSniffer/build/HTMLCS.js'
});
```

Defaults to a local copy of HTML CodeSniffer, found in [lib/vendor/HTMLCS.js](lib/vendor/HTMLCS.js).

### `ignore` (array)

An array of result codes and types that you'd like to ignore. You can find the codes for each rule in the console output and the types are `error`, `warning`, and `notice`.

```js
pa11y({
    ignore: [
        'notice',
        'WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2'
    ]
});
```

Defaults to an empty array.

### `log` (object)

An object which implements the methods `debug`, `error`, and `info` which will be used to report errors and test information.

```js
pa11y({
    log: {
        debug: console.log.bind(console),
        error: console.error.bind(console),
        info: console.info.bind(console)
    }
});
```

Each of these defaults to an empty function.

### `page.headers` (object)

A key-value map of request headers to send when testing a web page.

```js
pa11y({
    page: {
        headers: {
            Cookie: 'foo=bar'
        }
    }
});
```

Defaults to an empty object.

### `page.settings` (object)

A key-value map of settings to add to the PhantomJS page. For a full list of available settings, see the [PhantomJS page settings documentation][phantom-page-settings].

```js
pa11y({
    page: {
        settings: {
            loadImages: false,
            userName: 'nature',
            password: 'say the magic word'
        }
    }
});
```

Defaults to:

```js
{
    userAgent: 'pa11y/<version> (truffler/<version>)'
}
```

### `page.viewport` (object)

The viewport width and height in pixels. The `viewport` object must have both `width` and `height` properties.

```js
pa11y({
    page: {
        viewport: {
            width: 320,
            height: 480
        }
    }
});
```

Defaults to:

```js
{
    width: 1024,
    height: 768
}
```

### `phantom` (object)

A key-value map of settings to initialise PhantomJS with. This is passed directly into the `phantom` module – [documentation can be found here][phantom-node-options]. You can pass PhantomJS command-line parameters in the `phantom.parameters` option as key-value pairs.

```js
pa11y({
    phantom: {
        port: 1234,
        parameters: {
            'ignore-ssl-errors': 'false',
            'ssl-protocol': 'tlsv1'
        }
    }
});
```

Defaults to:

```js
{
    parameters: {
        'ignore-ssl-errors': 'true'
    }
}
```

If `phantom.port` is not specified, a random available port will be used.

### `standard` (string)

The accessibility standard to use when testing pages. This should be one of `Section508`, `WCAG2A`, `WCAG2AA`, or `WCAG2AAA` (or match one of the standards in the [`allowedStandards`](#allowedstandards-array) option).

```js
pa11y({
    standard: 'Section508'
});
```

Defaults to `WCAG2AA`.

### `timeout` (number)

The time in milliseconds that a test should be allowed to run before calling back with a timeout error.

```js
pa11y({
    timeout: 500
});
```

Defaults to `30000`.

### `wait` (number)

The time in milliseconds to wait before running HTML CodeSniffer on the page.

```js
pa11y({
    wait: 500
});
```

Defaults to `0`.


Examples
--------

### Basic Example

Run pa11y on a URL and output the results:

```
node example/basic
```

### Multiple Example

Use [async][async] to run pa11y on multiple URLs in series, and output the results:

```
node example/multiple
```


Common Questions
----------------

Common questions about pa11y are answered here.

### How do I set cookies on a tested page?

Use the `page.headers` option either in your JS code or in your config file:

```js
pa11y({
    page: {
        headers: {
            Cookie: 'foo=bar'
        }
    }
});
```

### How can pa11y log in if my site's behind basic auth?

Use the `page.settings` option either in your JS code or in your config file to set a username and password:

```js
pa11y({
    page: {
        settings: {
            userName: 'nature',
            password: 'say the magic word'
        }
    }
});
```

### How can pa11y log in if my site has a log in form?

Use the `beforeScript` option either in your JS code or in your config file to input login details and submit the form.
Once the form has been submitted you will also have to wait until the page you want to test has loaded before calling `next` to run pa11y.

```js
pa11y({
	beforeScript: function(page, options, next) {
		var waitUntil = function(condition, retries, waitOver) {
			page.evaluate(condition, function(error, result) {
				if (result || retries < 1) {
					waitOver();
				} else {
					retries -= 1;
					setTimeout(function() {
						waitUntil(condition, retries, waitOver);
					}, 200);
				}
			});
		};

		page.evaluate(function() {
			var user = document.querySelector('#username');
			var password = document.querySelector('#password');
			var submit = document.querySelector('#submit');

			user.value = 'exampleUser';
			password.value = 'password1234';

			submit.click();

		}, function() {

			waitUntil(function() {
				return window.location.href === 'http://example.com/myaccount';
			}, 20, next);
		});
	}
});
```

### How can I use pa11y with a proxy server?

Use the `phantom.parameters` option either in your JS code or in your config file:

```js
pa11y({
    phantom: {
        parameters: {
            'proxy': '1.2.3.4:8080',
            'proxy-type': 'http',
            'proxy-auth': 'username:password'
        }
    }
});
```

These match PhantomJS [command-line parameters][phantom-cli]. `proxy-type` can be set to `http`, `socks5`, or `none`.

### How can I simulate a user interaction before running pa11y?

Use the `beforeScript` option either in your JS code or in your config file to simulate the interactions before running pa11y.

In this example, additional content is loaded via ajax when a button is clicked.
Once the content is loaded the `aria-hidden` atrribute switches from `true` to `false`.

```js
pa11y({
	beforeScript: function(page, options, next) {
		var waitUntil = function(condition, retries, waitOver) {
			page.evaluate(condition, function(error, result) {
				if (result || retries < 1) {
					waitOver();
				} else {
					retries -= 1;
					setTimeout(function() {
						waitUntil(condition, retries, waitOver);
					}, 200);
				}
			});
		};

		page.evaluate(function() {
			var ajaxButton = document.querySelector('#loadContent');
			var dynamicContent = document.querySelector('#content');

			ajaxButton.click();

		}, function() {

			waitUntil(function() {
				return dynamicContent.getAttribute('aria-hidden') === 'false';
			}, 20, next);
		});
	}
});
```

Contributing
------------

To contribute to pa11y, clone this repo locally and commit your code on a separate branch.

Please write unit tests for your code, and check that everything works by running the following before opening a pull-request:

```sh
make ci
```


Migrating
---------

If you're using pa11y 1.0 or 2.0 and wish to migrate to 3.0, we've written a [Migration Guide](MIGRATION.md) to help with that.

It's recommended that you migrate to 3.0 as soon as possible, but we maintain branches for previous major versions. Each of these will be supported (critical bug fixes only) for 1 year from the next major version's released date:

- [pa11y 2.0][2.x] (support ends 16th October 2016)
- [pa11y 1.0][1.x] (support ends 8th June 2016)

If you're opening issues related to these, please mention the version being used.


License
-------

pa11y is licensed under the [Lesser General Public License (LGPL-3.0)][info-license].  
Copyright &copy; 2013, Springer Nature



[1.0-json-reporter]: https://github.com/springernature/pa11y-reporter-1.0-json
[2.x]: https://github.com/springernature/pa11y/tree/2.x
[1.x]: https://github.com/springernature/pa11y/tree/1.x
[async]: https://github.com/caolan/async
[brew]: http://mxcl.github.com/homebrew/
[jscs]: http://jscs.info/
[node]: http://nodejs.org/
[npm]: https://www.npmjs.com/
[phantom]: http://phantomjs.org/
[phantom-cli]: http://phantomjs.org/api/command-line.html
[phantom-node-options]: https://github.com/baudehlo/node-phantom-simple#node-phantom-simple
[phantom-page-settings]: http://phantomjs.org/api/webpage/property/settings.html
[sniff]: http://squizlabs.github.com/HTML_CodeSniffer/
[windows-install]: https://github.com/TooTallNate/node-gyp#installation

[info-coverage]: https://coveralls.io/github/springernature/pa11y
[info-dependencies]: https://gemnasium.com/springernature/pa11y
[info-license]: LICENSE
[info-node]: package.json
[info-npm]: https://www.npmjs.com/package/pa11y
[info-build]: https://travis-ci.org/springernature/pa11y
[shield-dependencies]: https://img.shields.io/gemnasium/springernature/pa11y.svg
[shield-coverage]: https://img.shields.io/coveralls/springernature/pa11y.svg
[shield-license]: https://img.shields.io/badge/license-LGPL%203.0-blue.svg
[shield-node]: https://img.shields.io/badge/node.js%20support-0.12–5-brightgreen.svg
[shield-npm]: https://img.shields.io/npm/v/pa11y.svg
[shield-build]: https://img.shields.io/travis/springernature/pa11y/master.svg

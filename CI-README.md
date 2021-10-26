
# Pa11y CI

Pa11y CI is an accessibility test runner built using [Pa11y] focused on running on Continuous Integration environments.

Pa11y CI runs accessibility tests against multiple URLs and reports on any issues. This is best used during automated testing of your application and can act as a gatekeeper to stop a11y issues from making it to live.

[![NPM version][shield-npm]][info-npm]
[![Node.js version support][shield-node]][info-node]
[![Build status][shield-build]][info-build]
[![Dependencies][shield-dependencies]][info-dependencies]
[![LGPL-3.0 licensed][shield-license]][info-license]

---

## Table Of Contents

- [Requirements](#requirements)
- [Usage](#usage)
  - [Configuration](#configuration)
  - [Default configuration](#default-configuration)
  - [URL configuration](#url-configuration)
  - [Sitemaps](#sitemaps)
  - [Reporters](#reporters)
    - [Use Multiple reporters](#use-multiple-reporters)
    - [Write a custom reporter](#write-a-custom-reporter)
  - [Docker](#docker)
- [Tutorials and articles](#tutorials-and-articles)
- [Contributing](#contributing)
- [Support and Migration](#support-and-migration)
- [Licence](#licence)



## Requirements

This command line tool requires [Node.js] 8+. You can install through npm:

```sh
npm install -g pa11y-ci
```


## Usage

Pa11y CI can be used by running it as a command line tool, `pa11y-ci`:

```
Usage: pa11y-ci [options] [<paths>]

Options:

  -h, --help                       output usage information
  -V, --version                    output the version number
  -c, --config <path>              the path to a JSON or JavaScript config file
  -s, --sitemap <url>              the path to a sitemap
  -f, --sitemap-find <pattern>     a pattern to find in sitemaps. Use with --sitemap-replace
  -r, --sitemap-replace <string>   a replacement to apply in sitemaps. Use with --sitemap-find
  -x, --sitemap-exclude <pattern>  a pattern to find in sitemaps and exclude any url that matches
  -j, --json                       Output results as JSON
  -T, --threshold <number>         permit this number of errors, warnings, or notices, otherwise fail with exit code 2
  --reporter <reporter>            The reporter to use. Can be "cli", "json", an npm module, or a path to a local file.
```

### Configuration

By default, Pa11y CI looks for a config file in the current working directory, named `.pa11yci`. This should be a JSON file.

You can use the `--config` command line argument to specify a different file, which can be either JSON or JavaScript. The config files should look like this:

```json
{
    "urls": [
        "http://pa11y.org/",
        "http://pa11y.org/contributing"
    ]
}
```

Pa11y will be run against each of the URLs in the `urls` array and the paths specified as CLI arguments. Paths can be specified as relative, absolute and as [glob](https://github.com/isaacs/node-glob#glob) patterns.

### Default configuration

You can specify a default set of [pa11y configurations] that should be used for each test run. These should be added to a `defaults` object in your config. For example:

```json
{
    "defaults": {
        "timeout": 1000,
        "viewport": {
            "width": 320,
            "height": 480
        }
    },
    "urls": [
        "http://pa11y.org/",
        "http://pa11y.org/contributing"
    ]
}
```

Pa11y CI has a few of its own configurations which you can set as well:

  - `concurrency`: The number of tests that should be run in parallel. Defaults to `1`.
  - `useIncognitoBrowserContext`: Run test with an isolated incognito browser context, stops cookies being shared and modified between tests. Defaults to `true`.

### URL configuration

Each URL in your config file can be an object and specify [pa11y configurations] which override the defaults too. You do this by using an object instead of a string, and providing the URL as a `url` property on that object. This can be useful if, for example, you know that a certain URL takes a while to load or you want to check what the page looked like when the tests were run:

```json
{
    "defaults": {
        "timeout": 1000
    },
    "urls": [
        "http://pa11y.org/",
        {
            "url": "http://pa11y.org/contributing",
            "timeout": 50000,
            "screenCapture": "myDir/my-screen-capture.png"
        }
    ]
}
```

### Sitemaps

If you don't wish to specify your URLs in a config file, you can use an XML sitemap that's published somewhere online. This is done with the `--sitemap` option:

```sh
pa11y-ci --sitemap http://pa11y.org/sitemap.xml
```

This takes the text content of each `<loc>` in the XML and runs Pa11y against that URL. This can also be combined with a config file, but URLs in the sitemap will override any found in your JSON config.

If you'd like to perform a find/replace operation on each URL in a sitemap, e.g. if your sitemap points to your production URLs rather than local ones, then you can use the following flags:

```sh
pa11y-ci --sitemap http://pa11y.org/sitemap.xml --sitemap-find pa11y.org --sitemap-replace localhost
```

The above would ensure that you run Pa11y CI against local URLs instead of the live site.

If there are items in the sitemap that you'd like to exclude from the testing (for example PDFs) you can do so using the `--sitemap-exclude` flag.

## Reporters

Pa11y CI includes both a CLI reporter that outputs pa11y results to the console and a JSON reporter that outputs JSON-formatted results (to the console or a file). If no reporter is specified, the CLI reporter is selected by default.  You can use the `--reporter` option to define a single reporter. The option value can be:
- `cli` for the included CLI reporter or `json` for the included JSON reporter
- the path of a locally installed npm module (ie: `pa11y-reporter-html`)
- the path to a local node module relative to the current working directory (ie: `./reporters/my-reporter.js`)
- an absolute path to a node module (ie: `/root/user/me/reporters/my-reporter.js`)

Example:

```
npm install pa11y-reporter-html --save
pa11y-ci --reporter=pa11y-reporter-html http://pa11y.org/
```

**Note**: If custom reporter(s) are specified, the default CLI reporter will be overridden.

### Use Multiple reporters

You can use multiple reporters by setting them on the `defaults.reporters` array in your config.  The shorthand `cli` and `json` can be included to select the included reporters.

```json
{
    "defaults": {
        "reporters": [
            "cli", // <-- this is the default reporter
            "pa11y-reporter-html",
            "./my-local-reporter.js"
        ]
    },
    "urls": [
        "http://pa11y.org/",
        {
            "url": "http://pa11y.org/contributing",
            "timeout": 50000,
            "screenCapture": "myDir/my-screen-capture.png"
        }
    ]
}
```

**Note**: If the CLI `--reporter` option is specified, it will override any reporters specified in the config file.

### Reporter options

Reporters can be configured, when supported, by settings the reporter as an array with its options as the second item:

```json
{
    "defaults": {
        "reporters": [
            "pa11y-reporter-html",
            ["./my-local-reporter.js", { "option1": true }] // <-- note that this is an array
        ]
    },
    "urls": [
        "http://pa11y.org/",
        {
            "url": "http://pa11y.org/contributing",
            "timeout": 50000,
            "screenCapture": "myDir/my-screen-capture.png"
        }
    ]
}
```

The included CLI reporter does not support any options.

The included JSON reporter outputs the results to the console by default.  It can also accept a `fileName` with a relative or absolute file name where the JSON results will be written. Relative file name will be resolved from the current working directory.

```json
{
    "defaults": {
        "reporters": [
            ["json", { "fileName": "./results.json" }] // <-- note that this is an array
        ]
    },
    "urls": [
        "http://pa11y.org/"
    ]
}
```

### Write a custom reporter

Pa11y CI reporters use an interface similar to [pa11y reporters] and support the following optional methods:

- `beforeAll(urls)`: called at the beginning of the process. `urls` is the URLs array defined in your config
- `afterAll(report)` called at the very end of the process with the following arguments:
  - `report`: pa11y-ci report object
  - `config`: pa11y-ci configuration object
- `begin(url)`: called before processing each URL. `url` is the URL being processed
-  `results(results, config)` called after pa11y test run with the following arguments:
    - `results`: pa11y results object [URL configuration object](#url-configuration)
    - `config`: the current [URL configuration object](#url-configuration)
- `error(error, url, config)`: called when a test run fails with the following arguments:
    - `error`: pa11y error message
    - `url`: the URL being processed
    - `config`: the current [URL configuration object](#url-configuration)

Here is an example of a custom reporter writing pa11y-ci report and errors to files:

```js
const fs = require('fs');
const { createHash } = require('crypto');

// create a unique filename from URL
function fileName(url: any, prefix = '') {
    const hash = createHash('md5').update(url).digest('hex');
    return `${prefix}${hash}.json`;
}

exports.afterAll = function (report) {
    return fs.promises.writeFile('report.json', JSON.stringify(report), 'utf8');
}
// write error details to an individual log for each URL
exports.error = function (error, url) {
    const data = JSON.stringify({url, error});
    return fs.promises.writeFile(fileName(url, 'error-'), data, 'utf8');
}
```

#### Configurable reporters

A configurable reporter is a special kind of pa11y-ci reporter exporting a single factory function as its default export.

When initialized, the function receives the user configured options (if any) and pa11y-ci configuration object as argument.

For example, here is a reporter writing all results to a single configurable file:

```js
// ./my-reporter.js 

const fs = require('fs');

module.exports = function (options) {
    // initialize an empty report data
    const customReport = {
        results: {},
        errors: [],
        violations: 0,
    }

    const fileName = options.fileName

    return {
        // add test results to the report
        results(results) {
            customReport.results[results.pageUrl] = results;
            customReport.violations += results.issues.length;
        },

        // also store errors
        error(error, url) {
            customReport.errors.push({ error, url });
        },

        // write to a file
        afterAll() {
            const data = JSON.stringify(customReport);
            return fs.promises.writeFile(fileName, data, 'utf8');
        }
    }
};
```

```json
// configuration file
{
    "defaults": {
        "reporters": [
            ["./my-reporter.js", { "fileName": "./my-report.json" }]
        ]
    },
    "urls": [
        ...
    ]
}
```

### Docker

If you want to run `pa11y-ci` in a Docker container then you can use the [`buildkite/puppeteer`](https://github.com/buildkite/docker-puppeteer) image as this installs Chrome and all the required libs to run headless chrome on Linux.

You will need a `config.json` that sets the `--no-sandbox` Chromium launch arguments:
```json
{
    "defaults": {
        "chromeLaunchConfig": {
            "args": [
                "--no-sandbox"
            ]
        }
    },
    "urls": [
        "http://pa11y.org/",
        "http://pa11y.org/contributing"
    ]
}
```

And then a Dockerfile that installs `pa11y-ci` and adds the `config.json`

```Dockerfile
FROM buildkite/puppeteer:v1.15.0

RUN npm install --global --unsafe-perm pa11y-ci
ADD config.json /usr/config.json

ENTRYPOINT ["pa11y-ci", "-c", "/usr/config.json"]
```

## Tutorials and articles

Here are some useful articles written by Pa11y users and contributors:

- [Automated accessibility testing with Travis and Pa11y CI](http://andrewmee.com/posts/automated-accessibility-testing-node-travis-ci-pa11y/)


## Contributing

There are many ways to contribute to Pa11y CI, we cover these in the [contributing guide](CONTRIBUTING.md) for this repo.

If you're ready to contribute some code, clone this repo locally and commit your code on a new branch.

Please write unit tests for your code, and check that everything works by running the following before opening a <abbr title="pull request">PR</abbr>:

```sh
npm run lint
npm test
```

You can also run verifications and tests individually:

```sh
npm run lint                # Verify all of the code (ESLint)
npm test                    # Run all tests
npm run test-unit           # Run the unit tests
npm run coverage            # Run the unit tests with coverage
npm run test-integration    # Run the integration tests
```


## Support and Migration

Pa11y CI major versions are normally supported for 6 months after their last minor release. This means that patch-level changes will be added and bugs will be fixed. The table below outlines the end-of-support dates for major versions, and the last minor release for that version.

We also maintain a [migration guide](MIGRATION.md) to help you migrate.

| :grey_question: | Major Version | Last Minor Release | Node.js Versions | Support End Date |
| :-------------- | :------------ | :----------------- | :--------------- | :--------------- |
| :heart:         | 2             | N/A                | 8+               | N/A              |
| :hourglass:     | 1             | 1.3                | 4+               | 2018-04-18       |

If you're opening issues related to these, please mention the version that the issue relates to.


## Licence

Licensed under the [Lesser General Public License (LGPL-3.0)](LICENSE).<br/>
Copyright &copy; 2016–2017, Team Pa11y


[issues]: https://github.com/pa11y/pa11y-ci/issues
[node.js]: https://nodejs.org/
[pa11y]: https://github.com/pa11y/pa11y
[pa11y configurations]: https://github.com/pa11y/pa11y#configuration
[pa11y reporters]: https://github.com/pa11y/pa11y#reporters
[sidekick-proposal]: https://github.com/pa11y/sidekick/blob/master/PROPOSAL.md
[twitter]: https://twitter.com/pa11yorg

[info-dependencies]: https://gemnasium.com/pa11y/pa11y-ci
[info-license]: LICENSE
[info-node]: package.json
[info-npm]: https://www.npmjs.com/package/pa11y-ci
[info-build]: https://travis-ci.org/pa11y/pa11y-ci
[shield-dependencies]: https://img.shields.io/gemnasium/pa11y/pa11y-ci.svg
[shield-license]: https://img.shields.io/badge/license-LGPL%203.0-blue.svg
[shield-node]: https://img.shields.io/badge/node.js%20support-8-brightgreen.svg
[shield-npm]: https://img.shields.io/npm/v/pa11y-ci.svg
[shield-build]: https://img.shields.io/travis/pa11y/pa11y-ci/master.svg

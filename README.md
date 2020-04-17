
# Pa11y CI

Pa11y CI is a CI-centric accessibility test runner, built using [Pa11y].

CI runs accessibility tests against multiple URLs and reports on any issues. This is best used during automated testing of your application and can act as a gatekeeper to stop a11y issues from making it to live.

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
- [Tutorials and articles](#tutorials-and-articles)
- [Contributing](#contributing)
- [License](#license)


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

  - `concurrency`: The number of tests that should be run in parallel. Defaults to `2`.
  - `useIncognitoBrowserContext`: Run test with an isolated incognito browser context, stops cookies being shared and modified between tests. Defaults to `false`.

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


## Tutorials and articles

Here are some useful articles written by Pa11y users and contributors:

- [Automated accessibility testing with Travis and Pa11y CI](http://andrewmee.com/posts/automated-accessibility-testing-node-travis-ci-pa11y/)


## Contributing

There are many ways to contribute to Pa11y CI, we cover these in the [contributing guide](CONTRIBUTING.md) for this repo.

If you're ready to contribute some code, clone this repo locally and commit your code on a new branch.

Please write unit tests for your code, and check that everything works by running the following before opening a <abbr title="pull request">PR</abbr>:

```sh
make ci
```

You can also run verifications and tests individually:

```sh
make verify              # Verify all of the code (JSHint/JSCS)
make test                # Run all tests
make test-unit           # Run the unit tests
make test-unit-coverage  # Run the unit tests with coverage
make test-integration    # Run the integration tests
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

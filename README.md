
# Pa11y CI ![beta stage][status-badge]

This is a new project based around Pa11y, named Pa11y CI. Pa11y CI will be a command-line tool which runs Pa11y against multiple URLs. It will be heavily geared towards easily running in CI environments against new versions of websites, but will also be runnable in local development.

:sparkles: [Click here for the full proposal document, project roadmap, and FAQs](PROPOSAL.md) :sparkles:

---


[![NPM version][shield-npm]][info-npm]
[![Node.js version support][shield-node]][info-node]
[![Build status][shield-build]][info-build]
[![Dependencies][shield-dependencies]][info-dependencies]
[![LGPL-3.0 licensed][shield-license]][info-license]


## Requirements

This command line tool requires [Node.js] 4+. You can install through npm:

```sh
npm install -g pa11y-ci
```


## Usage

Pa11y CI can be used by running it as a command line tool, `pa11y-ci`:

```
Usage: pa11y-ci [options]

Options:

  -h, --help                      output usage information
  -V, --version                   output the version number
  -c, --config <path>             the path to a JSON or JavaScript config file
  -s, --sitemap <url>             the path to a sitemap
  -f, --sitemap-find <pattern>    a pattern to find in sitemaps. Use with --sitemap-replace
  -r, --sitemap-replace <string>  a replacement to apply in sitemaps. Use with --sitemap-find
  -j, --json                      Output results as JSON
  -T, --threshold <number>        permit this number of errors, warnings, or notices, otherwise fail with exit code 2
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

Pa11y will be run against each of the URLs in the `urls` array.

### Default configuration

You can specify a default set of [pa11y configurations] that should be used for each test run. These should be added to a `default` object in your config. For example:

```json
{
    "defaults": {
        "timeout": 1000,
        "page": {
            "viewport": {
                "width": 320,
                "height": 480
            }
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

### URL configuration

Each URL in your config file can be an object and specify [pa11y configurations] which override the defaults too. You do this by using an object instead of a string, and providing the URL as a `url` property on that object. This can be useful if you know that a certain URL takes a while to load, for example:

```json
{
    "defaults": {
        "timeout": 1000
    },
    "urls": [
        "http://pa11y.org/",
        {
            "url": "http://pa11y.org/contributing",
            "timeout": 50000
        }
    ]
}
```

### Sitemaps

If you don't wish to specify your URLs in a config file, you can use an XML sitemap that's published somewhere online. This is done with the `--sitemap` option:

```sh
pa11y-ci --sitemap http://pa11y.org/sitemap.xml
```

This takes the text content of each `<loc>` in the XML and runs Pa11y against that URL. This can also be combined with a config file, but URLs in the Sitemap will override any found in your JSON config.

If you'd like to perform a find/replace operation on each URL in a sitemap, e.g. if your sitemap points to your production URLs rather than local ones, then you can use the following flags:

```sh
pa11y-ci --sitemap http://pa11y.org/sitemap.xml --sitemap-find pa11y.org --sitemap-replace localhost
```

The above would ensure that you run Pa11y CI against local URLs instead of the live site.


## Contributing

To contribute to Pa11y CI, clone this repo locally and commit your code on a new branch.

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


## Licence

Licensed under the [Lesser General Public License (LGPL-3.0)](LICENSE).  
Copyright &copy; 2016, Team Pa11y.



[issues]: https://github.com/pa11y/ci/issues
[node.js]: https://nodejs.org/
[pa11y configurations]: https://github.com/pa11y/pa11y#configuration
[status-badge]: https://img.shields.io/badge/status-beta-yellowgreen.svg
[twitter]: https://twitter.com/pa11yorg

[info-dependencies]: https://gemnasium.com/pa11y/ci
[info-license]: LICENSE
[info-node]: package.json
[info-npm]: https://www.npmjs.com/package/pa11y-ci
[info-build]: https://travis-ci.org/pa11y/ci
[shield-dependencies]: https://img.shields.io/gemnasium/pa11y/ci.svg
[shield-license]: https://img.shields.io/badge/license-LGPL%203.0-blue.svg
[shield-node]: https://img.shields.io/badge/node.js%20support-4–6-brightgreen.svg
[shield-npm]: https://img.shields.io/npm/v/pa11y-ci.svg
[shield-build]: https://img.shields.io/travis/pa11y/ci/master.svg

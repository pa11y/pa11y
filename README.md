# Pa11y JSON Reporter

A JSON reporter for [Pa11y 5.0](https://github.com/pa11y/pa11y).

**:warning: this reporter is built into Pa11y, there's no need to install separately :warning:**

[![NPM version][shield-npm]][info-npm]
[![Build status][shield-build]][info-build]
[![LGPL-3.0 licensed][shield-license]][info-license]

## Table Of Contents

* [Requirements](#requirements)
  * [Compatibility chart](#compatibility-chart)
* [Usage](#usage)
  * [Command-Line](#command-line)
  * [JavaScript](#javascript)
* [Contributing](#contributing)
* [License](#license)

## Requirements

Pa11y JSON Reporter is compatible with Pa11y 5 and later versions. It will not work with older versions of Pa11y.

### Compatibility chart

| Pa11y version | Pa11y CLI reporter version |
|---------------|----------------------------|
| 1.x - 4.x     | Unsupported                |
| 5.x           | 1.x                        |
| 6.x           | 2.x                        |

## Usage

### Command-Line

Install Pa11y and Pa11y JSON Reporter with [npm](https://www.npmjs.com/) (locally or globally is fine):

```sh
npm install -g pa11y pa11y-reporter-json
```

Run Pa11y using the JSON reporter:

```sh
pa11y --reporter json http://example.com
```

### JavaScript

Assuming you've installed both Pa11y and Pa11y JSON Reporter:

```js
const json = require('pa11y-reporter-json');
const pa11y = require('pa11y');

pa11y('http://example.com').then(results => {
    // Returns a string with the results formatted as JSON
    const jsonResults = json.results(results);
    console.log(jsonResults);
});
```

## Contributing

There are many ways to contribute to Pa11y JSON Reporter, we cover these in the [contributing guide](CONTRIBUTING.md) for this repo.

If you're ready to contribute some code, clone this repo locally and commit your code on a new branch.

Please write unit tests for your code, and check that everything works by running the following before opening a Pull Request:

```sh
make ci
```

You can also run verifications and tests individually:

```sh
make verify              # Verify all of the code (ESLint)
make test                # Run all tests
make test-unit           # Run the unit tests
make test-unit-coverage  # Run the unit tests with coverage
```

## License

Pa11y JSON Reporter is licensed under the [Lesser General Public License (LGPL-3.0)][info-license].  
Copyright &copy; 2017, Team Pa11y

[info-license]: LICENSE
[info-npm]: https://www.npmjs.com/package/pa11y
[info-build]: https://travis-ci.org/pa11y/pa11y
[shield-license]: https://img.shields.io/badge/license-LGPL%203.0-blue.svg
[shield-npm]: https://img.shields.io/npm/v/pa11y-reporter-json.svg
[shield-build]: https://img.shields.io/travis/pa11y/pa11y-reporter-json/master.svg

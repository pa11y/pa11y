# Pa11y HTML CodeSniffer Runner

A HTML_CodeSniffer runner for [Pa11y](https://github.com/pa11y/pa11y).

[![NPM version][shield-npm]][info-npm]
[![Build status][shield-build]][info-build]
[![LGPL-3.0 licensed][shield-license]][info-license]

## Table of contents

* [Requirements](#requirements)
  * [Compatibility chart](#compatibility-chart)
* [Usage](#usage)
* [Contributing](#contributing)
* [License](#license)

## Requirements

The Pa11y HTML_CodeSniffer runner is compatible with Pa11y 5 and later versions. It will not work with older versions of Pa11y.

### Compatibility chart

| Pa11y version | Pa11y HTML_CodeSniffer runner version |
|---------------|---------------------------------------|
| 1.x - 4.x     | Unsupported                           |
| 5.x           | 1.x                                   |
| 6.x           | 2.x                                   |

## Usage

Install Pa11y and the Pa11y HTML_CodeSniffer runner with [npm](https://www.npmjs.com/) (locally or globally is fine):

```sh
npm install -g pa11y pa11y-runner-htmlcs
```

Run Pa11y using the HTML CodeSniffer runner:

```sh
pa11y --runner htmlcs http://example.com
```

## Contributing

There are many ways to contribute to the Pa11y HTML_CodeSniffer runner, we cover these in the [contributing guide](CONTRIBUTING.md) for this repo.

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

The Pa11y HTML_CodeSniffer runner is licensed under the [Lesser General Public License (LGPL-3.0)][info-license].  
Copyright &copy; 2018, Team Pa11y

[info-license]: LICENSE
[info-npm]: https://www.npmjs.com/package/pa11y-runner-htmlcs
[info-build]: https://travis-ci.org/pa11y/pa11y-runner-htmlcs
[shield-license]: https://img.shields.io/badge/license-LGPL%203.0-blue.svg
[shield-npm]: https://img.shields.io/npm/v/pa11y-runner-htmlcs.svg
[shield-build]: https://img.shields.io/travis/pa11y/pa11y-runner-htmlcs/master.svg

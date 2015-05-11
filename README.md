
pa11y
=====

pa11y is your automated accessibility testing pal. It runs [HTML CodeSniffer][sniff] from the command line for programmatic accessibility reporting.

**Note: this is an in-progress 2.0 rewrite**

[![NPM version][shield-npm]][info-npm]
[![Node.js version support][shield-node]][info-node]
[![Build status][shield-build]][info-build]
[![Dependencies][shield-dependencies]][info-dependencies]
[![GPL v3.0 licensed][shield-license]][info-license]

```sh
pa11y nature.com
```

```js
var pa11y = require('pa11y');
pa11y(options, function (error, test) {
    test('nature.com', function (error, results) {
        /* ... */
    });
});
```


Table Of Contents
-----------------

- [Command-Line Interface](#command-line-interface)
- [JavaScript Interface](#javascript-interface)
- [Contributing](#contributing)
- [License](#license)


Command-Line Interface
----------------------

TODO


JavaScript Interface
--------------------

TODO


Contributing
------------

To contribute to pa11y, clone this repo locally and commit your code on a separate branch.

Please write unit tests for your code, and check that everything works by running the following before opening a pull-request:

```sh
make lint test
```


License
-------

Copyright 2013 Nature Publishing Group.  
pa11y is licensed under the [GNU General Public License 3.0][info-license].



[sniff]: http://squizlabs.github.com/HTML_CodeSniffer/

[info-dependencies]: https://gemnasium.com/nature/pa11y
[info-license]: LICENSE
[info-node]: package.json
[info-npm]: https://www.npmjs.com/package/pa11y
[info-build]: https://travis-ci.org/nature/pa11y
[shield-dependencies]: https://img.shields.io/gemnasium/nature/pa11y.svg
[shield-license]: https://img.shields.io/badge/license-MIT-blue.svg
[shield-node]: https://img.shields.io/node/v/pa11y.svg?label=node.js%20support
[shield-npm]: https://img.shields.io/npm/v/pa11y.svg
[shield-build]: https://img.shields.io/travis/nature/pa11y/master.svg

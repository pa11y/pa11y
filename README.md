
Truffler
========

Run tests against web pages or HTML snippets.

**Current Version:** *0.0.0*  
**Node Support:** *0.10.x, 0.11.x*  
**License:** [MIT][mit]  
**Build Status:** [![Build Status][travis-img]][travis]


Install
-------

Install Truffler with [npm][npm]:

```sh
npm install truffler
```


Usage
-----

```js
// Load Truffler
var truffler = require('truffler');

// Create a test function
var test = truffler.createTester({
    tests: [
        function (dom, report, done) {
            if (!dom.getElementsByTagName('title').length) {
                report('Page should have a title');
            }
            done();
        }
    ]
});

// Run the tests on a URL
test('http://example.com/', function (err, results) {
    console.log(results); // ['Page should have a title']
});

// Run the tests on an HTML snippet
test('<p>Hello World!</p>', function (err, results) {
    console.log(results); // ['Page should have a title']
})
```

TODO: full usage docs


Contributing
------------

To contribute to Truffler, clone this repo locally and commit your code on a separate branch.

Please write unit tests for your code, and check that everything works by running the following before opening a pull-request:

```sh
make lint test
```


License
-------

Truffler is licensed under the [MIT][mit] license.  
Copyright &copy; 2014, Rowan Manning



[mit]: http://opensource.org/licenses/mit-license.php
[npm]: https://npmjs.org/
[travis]: https://travis-ci.org/rowanmanning/truffler
[travis-img]: https://travis-ci.org/rowanmanning/truffler.svg?branch=master

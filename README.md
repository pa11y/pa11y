
Truffler
========

Run tests against web pages or HTML snippets.

**Current Version:** *0.1.0*  
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
var truffler = require('truffler');
```

### Creating a tester

Create a test function using `truffler.init()`. This expects an array of test functions and an optional [`options`](#options) argument:

```js
var test = truffler.init([

    // Example test
    function (dom, report, done) {
        ...
    }

], { ... });
```

Each test function should accept three arguments:

- `dom` *(object)*: The DOM object of the page or HTML snippet being tested.
- `report` *(function)*: A function which can be called multiple times to report issues with the DOM.
- `done` *(function)*: A callback which should be called when the test is complete.

This example test will check that each `img` element in the DOM has an `alt` attribute:

```js
function (dom, report, done) {
    var images = dom.document.getElementsByTagName('img');
    for (var i = 0; i < images.length; i++) {
        if (images[i].getAttribute('alt') === null) {
            report('Images should have an `alt` attribute');
        }
    }
    done();
}
```

The `report` function accepts any data, not just strings. It's up to your test functions to decide how to represent the information. The report in the example above could look like this:

```js
report({
    type: 'error',
    msg: 'Images should have an `alt` attribute',
    html: images[i].outerHTML
});
```

If an error occurs in the test itself, then this can be reported in a couple of ways. Firstly by passing an error into the callback:

```js
function (dom, report, done) {
    done(new Error('Something went horribly wrong'));
}
```

Secondly, by simply throwing an error:

```js
function (dom, report, done) {
    throw new Error('Something went horribly wrong');
}
```

### Running tests

Once you have a test function, you can call it like any other function. It accepts two arguments:

- `context` *(string)*: The URL or HTML snippet to test.
- `done` *(function)*: A callback function to run when the tests are complete.

```js
var test = truffler.init([ ... ]);

test('http://example.com/', function (err, results) {
    ...
});

test('<p>Hello World!</p>', function (err, results) {
    ...
});
```

The callback should accept two arguments:

- `err` *(object)*: An error which occured in the tests.
- `results` *(array)*: An array of reports made by the `report` function in each test.

### Full example

```js
// Load Truffler
var truffler = require('truffler');

// Create a test function
var test = truffler.init([

    // Make sure the page contains at least one paragraph
    function (dom, report, done) {
        var paragraphs = dom.document.getElementsByTagName('p');
        if (!paragraphs.length) {
            report({
                type: 'warning',
                msg: 'There should be at least one paragraph in the page'
            });
        }
        done();
    },

    // Ensure each image in the page has alternative text
    function (dom, report, done) {
        var images = dom.document.getElementsByTagName('img');
        for (var i = 0; i < images.length; i++) {
            if (images[i].getAttribute('alt') === null) {
                report({
                    type: 'error',
                    msg: 'Images should have an `alt` attribute',
                    html: images[i].outerHTML
                });
            }
        }
        done();
    }

]);

// Run the tests on an HTML snippet
var exampleHtml = '<img src="foo.jpg"/><img src="bar.jpg"/>';
test(exampleHtml, function (err, results) {
    console.log(err); // null
    console.log(results);
    // [
    //     {
    //         type: 'warning',
    //         msg: 'There should be at least one paragraph in the page'
    //     },
    //     {
    //         type: 'error',
    //         msg: 'Images should have an `alt` attribute',
    //         html: '<img src="foo.jpg">'
    //     },
    //     {
    //         type: 'error',
    //         msg: 'Images should have an `alt` attribute',
    //         html: '<img src="bar.jpg">'
    //     }
    // ]
});
```

### Options

The `truffler.init` function accepts an optional second argument which is expected to be an options object. The following options are available:

- `concurrency` *(number)*: The number of tests which can run in parallel. Default: `10`.
- `scripts` *(array)*: An array of additional scripts to load into the page before testing. Default: `[]`.

The `scripts` option could be used, for example, to load jQuery into the page before testing commences:

```js
var test = truffler.init([ ... ], {
    scripts: [
        'http://code.jquery.com/jquery.js'
    ]
});
```


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

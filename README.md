pa11y
=====

pa11y is your automated accessibility testing pal.  
It runs [HTML CodeSniffer][sniff] from the command line for programmatic accessibility reporting.

**Current Version:** *1.6.2*  
**Build Status:** [![Build Status][travis-img]][travis]  
**Node Version Support:** *0.10*


Installing
----------

pa11y requires [Node.js][node] 0.10+ and [PhantomJS][phantom].

On a Mac, you can install these with [Homebrew][brew]:

```sh
$ brew install node
$ brew install phantomjs
```

If you're on Linux, you'll probably be able to work it out.

Windows users approach with caution – we've been able to get pa11y running (Windows 7, Node 0.10) but only after installing Visual Studio and the Windows SDK (as well as Git, Python and PhantomJS). The [Windows installation instructions for node-gyp][windows-install] are a good place to start.

Once you've got these dependencies, you can install pa11y globally with:

```sh
$ npm install -g pa11y
```


Command-Line Usage
------------------

Once installed, the `pa11y` command should be available to you.

```

  Usage: pa11y [options] <url>

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -r, --reporter <name>  specify a reporter to use, one of: console (default), csv, json
    -s, --standard <name>  specify a standard to use, one of: Section508, WCAG2A, WCAG2AA (default), WCAG2AAA
    -c, --htmlcs <url>     specify a URL to source HTML_CodeSniffer from. Default: squizlabs.github.io
    -C, --config <file>    specify a JSON config file for ignoring rules
    -t, --timeout <ms>     specify the number of milliseconds before a timeout error occurs. Default: 30000
    -u, --useragent <ua>   specify a useragent to use when loading your URL. Default: pa11y/<version>
    -v, --viewport <wxh>   specify the size of the browser viewport. Default: 640x480
    -p, --port <port>      specify the port to run the PhantomJS server on. Default: 12300
    -d, --debug            output debug messages
    --strict               upgrade warnings to errors for exit status

```

### Examples

```sh
# Run pa11y with console reporting
$ pa11y nature.com

# Run pa11y with CSV reporting and save to file
$ pa11y -r csv nature.com > report.csv

# Run pa11y with the WCAG2AAA ruleset
$ pa11y -s WCAG2AAA nature.com
```


JavaScript API
--------------

You can also use pa11y from JavaScript by requiring the module directly. This will give you access to the `pa11y.sniff` function. The sniff function accepts two arguments, the first is an options object, the second is a callback:

```js
var pa11y = require('pa11y');
pa11y.sniff(options, callback);
```

### Available Options

#### options.url
*(string)* The URL to sniff. Required.

#### options.reporter
*(string,object)* The reporter to use. This can be a string (see [command-line usage](#command-line-usage)) or an object (see [custom reporters](#custom-reporters)). Default `null`.

#### options.standard
*(string)* The standard to use. One of `Section508`, `WCAG2A`, `WCAG2AA`, `WCAG2AAA`. Default `WCAG2AA`.

#### options.htmlcs
*(string)* The URL to source HTML_CodeSniffer from. Default `http://squizlabs.github.io/HTML_CodeSniffer/build/HTMLCS.js`.

#### options.config
*(string,object)* The path to a JSON config file or a config object (see [configuration](#configuration)). Default `null`.

#### options.timeout
*(number)* The number of milliseconds before a timeout error occurs. Default `30000`.

#### options.useragent
*(string)* The user-agent to send with the request. Default `pa11y/<version>`.

#### options.port
*(number)* The port the PhantomJS server should run on. Default `12300`.

#### options.viewport.width
*(number)* The viewport width to load the page at.

#### options.viewport.height
*(number)* The viewport height to load the page at.

#### options.debug
*(boolean)* Whether to report debug-level messages. Default: `false`.

### Callback

The callback function should accept two arguments. The first is an error object or `null`, the second is an object containing the results of the sniff.

### Examples

```js
// Sniff a URL
pa11y.sniff({
    url: 'nature.com'
}, function (err, results) {
    console.log(results); // output results object to console
});

// Sniff a URL, specifying some options
pa11y.sniff({
    url: 'nature.com',
    standard: 'WCAG2AAA',
    timeout: 20000
}, function (err, results) {
    console.log(results); // output results object to console
});

// Sniff a nonexistent URL
pa11y.sniff({
    url: '$$$'
}, function (err, results) {
    console.log(err); // Error: URL could not be loaded
});
```


Configuration
-------------

pa11y can be configured via a JSON file or JavaScript object.

On the command line, specify a JSON configuration file with the `--config` flag:

```sh
$ pa11y --config ./config/pa11y.json nature.com
```

If you're using the JavaScript API, you can pass configurations in by either specifying a JSON file or passing in a config object directly:

```js
pa11y.sniff({
    config: __dirname + '/config/pa11y.json'
});

pa11y.sniff({
    config: {}
});
```

The config file or object should be formatted like the example below, where

- The `cookies` key is an array of maps containing only the required keys for [PhantomJS cookie objects][PhantomJS cookies].
- The `ignore` key holds an array of rule names you'd like to ignore. You can find the codes for each rule in the console output, so you can simply copy/paste these into your config. We also maintain a [list of all available rules][rules].

```json
{
	"cookies": [
		{
			"name": "cookie-name",
			"value": "cookie-value",
			"domain": "localhost"
		}
	],
	"ignore": [
		"WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2",
		"WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2"
	]
}
```

All configuration options are optional.


Caveats
-------

pa11y can't catch *all* accessibility errors. It'll catch many of them, but you should do manual checking as well.

Also, due to HTML CodeSniffer being a graphical tool which highlights elements in the DOM, pa11y is most useful to use as a rough benchmark of how many errors/warnings your site has. The messages themselves don't hold much value outside of the browser yet. We're working on this, and if you have any suggestions then we'd be happy to chat!


Custom Reporters
----------------

Writing your own reporter for pa11y is easy, and will allow you to customise the output. This can be useful for integrating with your CI, producing human-readable reports, graphing, etc.

When a reporter is specified, the program will look for node modules with the name `pa11y-reporter-<name>`. So if you use the following option:

```sh
$ pa11y -r rainbows nature.com
```

then pa11y will attempt to load the module [`pa11y-reporter-rainbows`][rainbows].

Reporter modules export the following functions, which will be used by pa11y when that reporter is selected. All functions are optional, but you'll need to implement at least `error` and `handleResult` for the reporter to be functional.

```js
exports.begin()                // Called before processing, used to output welcome messages or similar
exports.log(str)               // Called with logging information
exports.debug(str)             // Called with debug information if pa11y is run with the `-d` debug flag
exports.error(str)             // Called with error information
exports.handleResult(results)  // Called when results are available
exports.end()                  // Called once everything is done, just before the process exits
```

For example reporters, take a look at the [built-in reporters](lib/reporters) or the [rainbows reporter][rainbows].


Development
-----------

To develop pa11y, you'll need to clone the repo and install dependencies with `npm install`. You'll also need [Grunt][grunt] to be installed globally in order to run tests, you can do this with `npm install -g grunt-cli`.

Once you're set up, the following commands are available:

```sh
$ grunt       # Run the lint and test tasks together
$ grunt lint  # Run JSHint with the correct config
$ grunt test  # Run unit and functional tests
```

Code with lint errors or failing tests will not be accepted, please use the build tools outlined above.

For users with push-access, don't commit to the master branch. Code should be in `develop` until it's ready to be released.


License
-------

[Copyright 2013 Nature Publishing Group](LICENSE.txt).  
pa11y is licensed under the [GNU General Public License 3.0][gpl].



[brew]: http://mxcl.github.com/homebrew/
[gpl]: http://www.gnu.org/licenses/gpl-3.0.html
[grunt]: http://gruntjs.com/
[node]: http://nodejs.org/
[phantom]: http://phantomjs.org/
[rainbows]: https://github.com/rowanmanning/pa11y-reporter-rainbows
[PhantomJS cookies]:https://github.com/ariya/phantomjs/wiki/API-Reference#cookie-object
[rules]: https://github.com/nature/pa11y/wiki/HTML-CodeSniffer-Rules
[sniff]: http://squizlabs.github.com/HTML_CodeSniffer/
[travis]: https://travis-ci.org/nature/pa11y
[travis-img]: https://travis-ci.org/nature/pa11y.png?branch=master
[windows-install]: https://github.com/TooTallNate/node-gyp#installation

Troubleshooting
=====

Common Issues
----
### AngularJS
If you're testing against an AngularJS app, you may have trouble testing against the correct page when you make use of ngView to render templates. We recommend using [`actions`][actions] to wait until a particular URL fragment has loaded, or for an element to become available on the page.

You could also write a custom `beforeScript` [PhantomJS hook][phantom-hook] to capture an [emitted Angular view load event][ngViewLoaded]. 

You could also use a timeout to give your view time to load, but this is unreliable. 

### Why does Pa11y give different results to the HTML CodeSniffer bookmarklet?
Pa11y uses PhantomJS as a headless web browser to load the DOM content and can only analyze what is provided.
If parts of the DOM are been loaded after the document is first generated, you may get results that differ from the bookmarklet which runs in the browser and can test against the complete DOM.

If you use Pa11y and HTML CodeSniffer CLI you will find that you get the same results, which will both differ from the bookmarklet, a similar issue was highlighted by [HTML CodeSniffer][sniff-issue].

### Why does Pa11y give different results each time it runs?
This could be a number of things, but indicates that the content of your page changes in some way on each load. If you include advertising on your page then you can expect to see differing results, and sometimes your JavaScript may not have had time to execute before the Pa11y test runs.

To debug this, you can use the `--screen-capture` flag or [`screenCapture` option](https://github.com/pa11y/pa11y#screencapture-string) and compare the output for the differing test runs.

### Pa11y ignores the contents of iframes
Pa11y doesn't currently support testing against iframe content from a parent page context. Any page that makes use of iframes, e.g. for displaying ads, may show different error, warning, and notice counts in Pa11y compared to the HTML_CodeSniffer browser bookmarklet.

If you do need to test the contents of an iframe, run Pa11y against the iframe source URL directly.

### PhantomJS fails to run and returns exit code 127

Pa11y spins up a PhantomJS instance to render the page, then injects HTML_Codesniffer into it and returns a report based on its findings. If PhantomJS cannot run due to broken executable, missing libraries or dependencies, or any other internal error that prevents it from running at all, it will return an exit code of 127.

If this happens, running the phantomjs executable will usually provide more useful information, for example:

```
./node_modules/phantomjs/lib/phantom/bin/phantomjs: error while loading shared libraries: libfontconfig.so.1: cannot open shared object file: No such file or directory
```

We don't maintain PhantomJS, but there's a good chance someone has found the same problem before, so you can try to search in the PhantomJS repo for a solution. For example, for the error above, the fix would be to install the missing library, as shown in [phantomjs#10904](https://github.com/ariya/phantomjs/issues/10904) and [phantomjs#13597](https://github.com/ariya/phantomjs/issues/13597).

Common Questions
----
Common questions about Pa11y are answered here.

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

### How can Pa11y log in if my site's behind basic auth?

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

### How can Pa11y log in if my site has a log in form?

Use the [`actions`][actions] option to specify a series of actions to execute before Pa11y runs the tests:

```js
pa11y({
    actions: [
        'set field #username to exampleUser',
        'set field #password to password1234',
        'click element #submit',
        'wait for path to be /myaccount'
    ]
});
```

You can also use the `beforeScript` option for this, but it can be complicated and error-prone. See the [`beforeScript` example][beforeScript] for more information.

### How do I make Pa11y use POST requests?

You can use a few `page.settings` options, either in your JS code or in your config file. The example below simulates submitting a form:

```js
pa11y({
    page: {
        settings: {
            operation: 'POST',
            encoding: 'utf8',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: 'greeting=hello&subject=world'
        }
    }
});
```

### How can I use Pa11y with a proxy server?

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

### How can I simulate a user interaction before running Pa11y?

For simple interactions, we recommend using [actions][actions]. For more complex interactions, use the `beforeScript` option either in your JS code or in your config file to simulate the interactions before running Pa11y.

In this example, additional content is loaded via ajax when a button is clicked.
Once the content is loaded the `aria-hidden` attribute switches from `true` to `false`.

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

### Does Pa11y test the contrast of link hover states?

Pa11y doesn't check the hover state. Instead, you must test the contrast of the hover state for links manually.


Check to see if the issue has been reported
-----

Check the [issue tracker][issues] for similar issues.

Create an issue
-----

If all else fails, [create an issue][new-issue] and we'll help you.

Please include your Node.js, PhantomJS, and Pa11y version numbers, as well as your operating system. It may be useful to run `pa11y --environment` – this outputs all the details we need to know about your machine to help us debug your issue.

[actions]: https://github.com/pa11y/pa11y#actions
[beforeScript]: https://github.com/pa11y/pa11y/tree/master/example/before-script
[issues]: https://github.com/pa11y/pa11y/issues?utf8=%E2%9C%93&q=is%3Aissue
[new-issue]: https://github.com/pa11y/pa11y/issues/new

[ngViewLoaded]: https://github.com/angular-ui/ui-router/wiki#view-load-events
[phantom-cli]: http://phantomjs.org/api/command-line.html
[phantom-hook]: http://phantomjs.org/api/webpage/handler/on-callback.html
[sniff-issue]: https://github.com/squizlabs/HTML_CodeSniffer/issues/109

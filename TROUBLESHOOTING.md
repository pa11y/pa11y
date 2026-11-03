# Troubleshooting

## Common Issues

### Missing Chrome after installation with npm 12

[npm 12 blocks dependency installation scripts by default][npm-allow-scripts]. This includes
Puppeteer's Chrome download, so Pa11y can install successfully but then fail with
`Could not find Chrome`. Choose one of the following ways to provide a browser.

The script-based downloads below require npm's `ignore-scripts` setting to be `false`.

#### Global installation

Allow Puppeteer's script when installing Pa11y:

```sh
npm install --global pa11y --allow-scripts=puppeteer
```

If Pa11y is already installed and its browser download was skipped, run:

```sh
npm rebuild --global puppeteer --allow-scripts=puppeteer
```

The global commands above allow Puppeteer's script for that invocation. For local projects and CI,
save approval in `package.json` as shown below.

#### Project and CI installation

For a local project, save approval for Puppeteer's script in `package.json`. From the project
directory, run:

```sh
npm install --save-dev pa11y
npm approve-scripts puppeteer
npm rebuild puppeteer
```

[`npm approve-scripts`][npm-approve-scripts] records permission for the installed Puppeteer version
in your `package.json`. It does not run the script; `npm rebuild puppeteer` performs the skipped
download.
Commit the resulting `package.json` and `package-lock.json`. Review and renew the approval when
Puppeteer's version changes.

CI can then use the committed policy with:

```sh
npm ci
```

#### Install the browser separately

To manage the browser download separately from installation scripts, run this from a project where
Pa11y is installed:

```sh
npm explore pa11y -- npm exec --no -- puppeteer browsers install
```

This runs from Pa11y's package directory and uses its Puppeteer dependency to download the matching
browser. `--no` prevents npm from fetching another package if the executable is missing. See
[Puppeteer's configuration guide][puppeteer-configuration] for browser download options.

Download the browser as the user who will run Pa11y. If you set `PUPPETEER_CACHE_DIR`, use the same
value for the download and the Pa11y run. In CI, restoring `node_modules` does not restore
Puppeteer's browser cache; download the browser or restore that cache before running Pa11y.

#### Use an existing browser

You can instead configure Pa11y to use an existing compatible Chrome executable. Save a `pa11y.json`
file in the directory where you run Pa11y:

```json
{
    "chromeLaunchConfig": {
        "executablePath": "/absolute/path/to/chrome"
    }
}
```

Replace the example path with your browser's executable path. It must be compatible with the
Puppeteer version installed by Pa11y. See [Pa11y's browser launch options][chromeLaunchConfig] and
[command-line configuration][cli-configuration] for other configuration-file options.

### AngularJS

If you're testing against an AngularJS app, you may have trouble testing against the correct page when you make use of ngView to render templates. We recommend using [`actions`][actions] to wait until a particular URL fragment has loaded, or for an element to become available on the page.

You could also use a timeout to give your view time to load, but this is unreliable.

### Why does Pa11y give different results to the HTML_CodeSniffer bookmarklet?

Pa11y uses Headless Chrome as a web browser to load the DOM content and can only analyze what is provided.

If parts of the DOM are been loaded after the document is first generated, you may get results that differ from the bookmarklet which runs in the browser and can test against the complete DOM.

If you use Pa11y and HTML_CodeSniffer CLI you will find that you get the same results, which will both differ from the bookmarklet, a similar issue was highlighted by [HTML_CodeSniffer][sniff-issue].

### Why does Pa11y give different results each time it runs?

This could be a number of things, but indicates that the content of your page changes in some way on each load. If you include advertising on your page then you can expect to see differing results, and sometimes your JavaScript may not have had time to execute before the Pa11y test runs.

To debug this, you can use the `--screen-capture` flag or [`screenCapture` option](https://github.com/pa11y/pa11y#screencapture-string) and compare the output for the differing test runs.

### Pa11y ignores the contents of iframes

Pa11y doesn't currently support testing against iframe content from a parent page context. Any page that makes use of iframes, e.g. for displaying ads, may show different error, warning, and notice counts in Pa11y compared to the HTML_CodeSniffer browser bookmarklet.

If you do need to test the contents of an iframe, run Pa11y against the iframe source URL directly.

### Pa11y shows an error on Ubuntu 23.10+: `No usable sandbox!`

Ubuntu 23.10+ versions include a security feature called AppArmor which by default restrict user namespaces, and as a result may cause a Chrome exception through this project.
We suggest using the steps outlined on Chromium's documentation to help alleviate this challenge: [AppArmor User Namespace Restrictions vs. Chromium Developer Builds](https://chromium.googlesource.com/chromium/src/+/main/docs/security/apparmor-userns-restrictions.md).
For example, when leveraging Pa11y through automated testing such as GitHub Actions consider using [option 1](https://chromium.googlesource.com/chromium/src/+/main/docs/security/apparmor-userns-restrictions.md#option-1_the-easiest-way) to disable AppArmor user namespacing to help circumvent this issue.
Please use workarounds at your own risk based on your security and platform requirements.

## Common Questions

Common questions about Pa11y are answered here.

### How do I set cookies on a tested page?

Use the `headers` option either in your JS code or in your config file:

```js
pa11y('http://example.com', {
    headers: {
        Cookie: 'foo=bar'
    }
});
```

### How can Pa11y log in if my site's behind basic auth?

You can authenticate using basic auth by sending additional headers to Pa11y. This works with the JavaScript API, or on the command line by using a config file:

```js
const credentials = 'exampleuser:supersecretpassword';
const encodedCredentials = new Buffer(credentials).toString('base64');

pa11y('http://example.com', {
    headers: {
        Authorization: `Basic ${encodedCredentials}`
    }
});
```

### How can Pa11y log in if my site has a log in form?

Use the [`actions`][actions] option to specify a series of actions to execute before Pa11y runs the tests:

```js
pa11y('http://example.com', {
    actions: [
        'set field #username to exampleUser',
        'set field #password to password1234',
        'click element #submit',
        'wait for path to be /myaccount'
    ]
});
```

### How can I use Pa11y with a proxy server?

Proxy configuration can be passed through from Pa11y to Headless Chrome using the `args` propery of [`chromeLaunchConfig` option][chromeLaunchConfig];

```js
pa11y('http://example.com', {
    chromeLaunchConfig: {
        args: [
            '--proxy-server=127.0.0.1:9999',
        ]
    }
});
```

### How can I simulate a user interaction before running Pa11y?

We recommend using [actions][actions] (if the existing actions don't meet your needs, [please let us know](https://github.com/pa11y/pa11y/issues/228)).

### Does Pa11y test the contrast of link hover states?

Pa11y doesn't check the hover state. Instead, you must test the contrast of the hover state for links manually.

## Check to see if the issue has been reported

Check the [issue tracker][issues] for similar issues.

## Create an issue

If all else fails, [create an issue][new-issue] and we'll help you.

Please include your Node.js and Pa11y version numbers, as well as your operating system. It may be useful to run `pa11y --environment` – this outputs all the details we need to know about your machine to help us debug your issue.

[actions]: https://github.com/pa11y/pa11y#actions
[chromeLaunchConfig]: https://github.com/pa11y/pa11y#chromelaunchconfig-object
[cli-configuration]: https://github.com/pa11y/pa11y#command-line-configuration
[issues]: https://github.com/pa11y/pa11y/issues?utf8=%E2%9C%93&q=is%3Aissue
[new-issue]: https://github.com/pa11y/pa11y/issues/new
[ngViewLoaded]: https://github.com/angular-ui/ui-router/wiki#view-load-events
[sniff-issue]: https://github.com/squizlabs/HTML_CodeSniffer/issues/109
[npm-allow-scripts]: https://docs.npmjs.com/cli/v12/using-npm/config/#allow-scripts
[npm-approve-scripts]: https://docs.npmjs.com/cli/v12/commands/npm-approve-scripts/
[puppeteer-configuration]: https://pptr.dev/guides/configuration

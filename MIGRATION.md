
Migration Guide
===============

pa11y's API changes between major versions. This is a guide to help you make the switch when this happens.


Migrating From 1.0 To 2.0
-------------------------

### Command-Line Interface

The command-line interface in 2.0 is similar to 1.0, but there are a few key changes.

  - The `console` reporter has been renamed to `cli` and has a different output format
  - The `csv` reporter now includes the message context
  - The `json` reporter now outputs an array which matches the new [output format](#output-format)
  - Reporters no longer handle the way pa11y exits, this is controlled through the new `--level` flag
  - Custom reporters now have a different API, see the [README](README.md) for more information
  - The file specified by the `--config` flag now expects JSON in a different format. See [configuration](#configuration)
  - The `--htmlcs` flag has been removed, HTML CodeSniffer is now loaded from a local file
  - The `--useragent` flag has been removed, this is now managed through the config file
  - The `--viewport` flag has been removed, this is now managed through the config file
  - The `--strict` flag has been removed, this is controlled through the new `--level` flag

### JavaScript Interface

A two-step running process is now used over a single `pa11y.sniff()` function. This allows a single PhantomJS browser to run multiple tests, reducing memory usage and making pa11y more usful to derivative tools. See the [README](README.md) for more information.

### Output Format

Results in pa11y 2.0 are no longer output as an object, instead only the results array is provided. It's up to your code (or reporter) to add totals etc. Also the result format has been changed:

```js
// 1.0 result
{
  code: 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2',
  message: 'Check that the title element describes the document.',
  type: 'notice',
  html: '<title>Pa11y - Your automated accessib...</title>'
}

// 2.0 result
{
    code: 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2',
    context: '<title>Pa11y - Your automated accessib...</title>',
    message: 'Check that the title element describes the document.',
    type: 'notice',
    typeCode: 3
}
```

### Configuration

TODO

### Contributing/Testing

pa11y 2.0 uses Make over Grunt as a build tool. For Windows users, all of the Make targets should be runnable individually by copying commands from the Makefile and running within a terminal.

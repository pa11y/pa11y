# Migration Guide

Major versions of Pa11y CI can bring API or compatibility changes. This is a guide to help you make the switch when that happens.

## Migrating From 1.0 To 2.0

### Node.js Support

Pa11y CI 2.0 only supports Node.js v8.0.0 and higher, you'll need to upgrade to be able to use the latest versions of Pa11y CI.

### Changes to Pa11y Test Runner

Pa11y CI now uses Pa11y 5.0 to run its tests, which has introduced numerous changes to the underlying test runner.

Most importantly for upgrading your Pa11y CI, the new version of [Pa11y has removed or renamed numerous Configuration options](https://github.com/pa11y/pa11y/blob/master/MIGRATION.md#configuration).  If you are using one of these old configuration options, they will no longer be effective in Pa11y CI 2.0.

You can read more about all of the other changes to Pa11y in the [Pa11y Migration Guide](https://github.com/pa11y/pa11y/blob/master/MIGRATION.md#migrating-from-40-to-50)

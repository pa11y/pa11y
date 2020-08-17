# Changelog

## 2.4.0 (2020-08-18)

* Adds support for parsing sitemapindex (Thanks @42tte)
* Better test coverage (Thanks @kkoskelin)
* Updated dependencies and devDependencies
* Less eslint warnings
* Restrict dependency upgrades to bugfixes to avoid potential breakages when updating or integrating with other apps
* Minor documentation improvements and fixes

## 2.3.1 (2020-08-17)

Add missing puppeteer dependency

## 2.3.0 (2019-05-14)

* Add useIncognitoBrowserContext option for test runs

## 2.2.0 (2019-04-16)

* Allow loaded config to return promises

## 2.1.1 (2018-04-24)

* Pin puppeteer at 1.0.0 to fix file URL issues

## 2.1.0 (2018-04-09)

* Respect the Pa11y `threshold` configuration option for individual urls when determining whether to pass or fail

## 2.0.1 (2018-03-14)

* Fix an issue with reporting null contexts

## 2.0.0 (2018-03-12)

* See the [migration guide](https://github.com/pa11y/pa11y-ci/blob/master/MIGRATION.md#migrating-from-10-to-20) for details

## 1.3.1 (2017-12-06)

* Fix the way configurations are loaded

## 1.3.0 (2017-10-18)

* Add the ability to specify paths and URLs as command-line arguments
* Documentation updates

## 1.2.0 (2017-06-02)

* Add the ability to make Pa11y CI perform POST requests
* Documentation and linting updates

## 1.1.1 (2017-03-13)

* Update readme to document `--sitemap-exclude`

## 1.1.0 (2017-03-11)

* Add a `--sitemap-exclude` parameter to the command-line interface

## 1.0.2 (2017-03-08)

* Use Pa11y 4.7.0+

## 1.0.1 (2017-03-08)

* Use default wrapWidth if process.stdout.columns is reported as 0

## 1.0.0 (2017-03-07)

* Initial stable release

## 0.5.0 pre-release (2016-12-16)

* Add and document the `verifyPage` option

## 0.4.0 pre-release (2016-12-05)

* Exit with an error if config files have syntax errors

## 0.3.1 pre-release (2016-11-30)

* Updates pa11y dependency to ^4.2

## 0.3.0 pre-release (2016-09-20)

* Add a `--threshold` parameter to the command-line interface

## 0.2.0 pre-release (2016-07-26)

* Add support for find/replace in sitemap URLs

## 0.1.0 pre-release (2016-07-05)

* Initial release

#!/usr/bin/env node

//
// This is the entry-point for the command line test
// runner. This uses the function defined in the
// `lib/pa11y-ci.js` file and passes in command line
// options.
//
'use strict';

const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');
const pa11yCi = require('..');
const path = require('path');
const globby = require('globby');
const protocolify = require('protocolify');
const pkg = require('../package.json');
const commander = require('commander');


// Here we're using Commander to specify the CLI options
commander
	.version(pkg.version)
	.usage('[options] <paths>')
	.option(
		'-c, --config <path>',
		'the path to a JSON or JavaScript config file'
	)
	.option(
		'-s, --sitemap <url>',
		'the path to a sitemap'
	)
	.option(
		'-f, --sitemap-find <pattern>',
		'a pattern to find in sitemaps. Use with --sitemap-replace'
	)
	.option(
		'-r, --sitemap-replace <string>',
		'a replacement to apply in sitemaps. Use with --sitemap-find'
	)
	.option(
		'-x, --sitemap-exclude <pattern>',
		'a pattern to find in sitemaps and exclude any url that matches'
	)
	.option(
		'-j, --json',
		'Output results as JSON'
	)
	.option(
		'-T, --threshold <number>',
		'permit this number of errors, warnings, or notices, otherwise fail with exit code 2',
		'0'
	)
	.parse(process.argv);

// Parse the args into valid paths using glob and protocolify
const urls = globby.sync(commander.args, {
	// Ensure not-found paths (like "google.com"), are returned
	nonull: true
}).map(protocolify);

// Start the promise chain to actually run everything
Promise.resolve()
	.then(() => {
		// Load config based on the `--config` flag
		return loadConfig(commander.config);
	})
	.then(config => {
		// Load a sitemap based on the `--sitemap` flag
		if (commander.sitemap) {
			return loadSitemapIntoConfig(commander, config);
		}
		return config;
	})
	.then(config => {
		// Actually run Pa11y CI
		return pa11yCi(urls.concat(config.urls || []), config.defaults);
	})
	.then(report => {
		// Output JSON if asked for it
		if (commander.json) {
			console.log(JSON.stringify(report, (key, value) => {
				if (value instanceof Error) {
					return {
						message: value.message
					};
				}
				return value;
			}));
		}
		// Decide on an exit code based on whether
		// errors are below threshold or everything passes
		if (report.errors >= parseInt(commander.threshold, 10) && report.passes < report.total) {
			process.exit(2);
		} else {
			process.exit(0);
		}
	})
	.catch(error => {
		// Handle any errors
		console.error(error.message);
		process.exit(1);
	});

// This function loads the JSON or JavaScript config
// file specified by the user. It checks for config
// files in the following order:
//   - no extension (JSON)
//   - js extension (JavaScript)
//   - json extension (JSON)
function loadConfig(configPath) {
	return new Promise((resolve, reject) => {
		configPath = resolveConfigPath(configPath);
		let config;
		try {
			config = loadLocalConfigUnmodified(configPath);
			if (!config) {
				config = loadLocalConfigWithJs(configPath);
			}
			if (!config) {
				config = loadLocalConfigWithJson(configPath);
			}
			if (commander.config && !config) {
				return reject(new Error(`The config file "${configPath}" could not be loaded`));
			}
		} catch (error) {
			return reject(
				new Error(`There was a problem loading "${configPath}":\n${error.stack}`)
			);
		}

		// Allow loaded configs to return a promise
		Promise.resolve(config).then(loadedConfig => {
			resolve(defaultConfig(loadedConfig || {}));
		});
	});
}

// Resolve the config path, and make sure it's
// relative to the current working directory
function resolveConfigPath(configPath) {
	// Specify a default
	configPath = configPath || '.pa11yci';
	if (configPath[0] !== '/') {
		configPath = path.join(process.cwd(), configPath);
	}
	if (/\.js(on)?$/.test(configPath)) {
		configPath = configPath.replace(/\.js(on)?$/, '');
	}
	return configPath;
}

// Load the config file using the exact path that
// was passed in
function loadLocalConfigUnmodified(configPath) {
	try {
		return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
	} catch (error) {
		if (error.code !== 'ENOENT') {
			throw error;
		}
	}
}

// Load the config file but adding a .js extension
function loadLocalConfigWithJs(configPath) {
	try {
		return require(`${configPath}.js`);
	} catch (error) {
		if (error.code !== 'MODULE_NOT_FOUND') {
			throw error;
		}
	}
}

// Load the config file but adding a .json extension
function loadLocalConfigWithJson(configPath) {
	try {
		return require(`${configPath}.json`);
	} catch (error) {
		if (error.code !== 'MODULE_NOT_FOUND') {
			throw error;
		}
	}
}

// Tidy up and default the configurations found in
// the file the user specified.
function defaultConfig(config) {
	config.urls = config.urls || [];
	config.defaults = config.defaults || {};
	config.defaults.log = config.defaults.log || console;
	// 	Setting to undefined rather than 0 allows for a fallback to the default
	config.defaults.wrapWidth = process.stdout.columns || undefined;
	if (commander.json) {
		delete config.defaults.log;
	}
	return config;
}

// Load a sitemap from a remote URL, parse out the
// URLs, and add them to an existing config object
function loadSitemapIntoConfig(program, initialConfig) {
	const sitemapFind = (
		program.sitemapFind ?
		new RegExp(program.sitemapFind, 'gi') :
		null
	);
	const sitemapReplace = program.sitemapReplace || '';
	const sitemapExclude = (
		program.sitemapExclude ?
		new RegExp(program.sitemapExclude, 'gi') :
		null
	);

	function getUrlsFromSitemap(sitemapUrl, config) {
		return Promise.resolve()
		.then(() => fetch(sitemapUrl))
		.then(response => response.text())
		.then(body => {
			const $ = cheerio.load(body, {xmlMode: true});

			const isSitemapIndex = $('sitemapindex').length > 0;
			if (isSitemapIndex) {
				return Promise.all($('sitemap > loc').toArray().map(element => {
					return getUrlsFromSitemap($(element).text(), config);
				})).then(configs => {
					return configs.pop();
				});
			}

			$('url > loc').toArray().forEach(element => {
				let url = $(element).text();
				if (sitemapExclude && url.match(sitemapExclude)) {
					return;
				}
				if (sitemapFind) {
					url = url.replace(sitemapFind, sitemapReplace);
				}
				config.urls.push(url);
			});

			return config;
		})
		.catch(error => {
			if (error.stack && error.stack.includes('node-fetch')) {
				throw new Error(`The sitemap "${sitemapUrl}" could not be loaded`);
			}
			throw new Error(`The sitemap "${sitemapUrl}" could not be parsed`);
		});
	}

	return getUrlsFromSitemap(program.sitemap, initialConfig);
}

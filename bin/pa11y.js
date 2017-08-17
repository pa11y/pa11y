#!/usr/bin/env node
'use strict';

var extend = require('node.extend');
var path = require('path');
var pkg = require('../package.json');
var program = require('commander');
var pa11y = require('../lib/pa11y');

configureProgram(program);
runProgram(program);

function configureProgram(program) {
	program.version(pkg.version)
		.usage('[options] <url>')
		.option(
			'-n, --environment',
			'output details about the environment Pa11y will run in'
		)
		.option(
			'-s, --standard <name>',
			'the accessibility standard to use: Section508, WCAG2A, WCAG2AA (default), WCAG2AAA'
		)
		.option(
			'-r, --reporter <reporter>',
			'the reporter to use: cli (default), csv, tsv, html, json',
			'cli'
		)
		.option(
			'-l, --level <level>',
			'the level of message to fail on (exit with code 2): error, warning, notice',
			'error'
		)
		.option(
			'-T, --threshold <number>',
			'permit this number of errors, warnings, or notices, otherwise fail with exit code 2',
			'0'
		)
		.option(
			'-i, --ignore <ignore>',
			'types and codes of messages to ignore, a repeatable value or separated by semi-colons',
			collectOptions,
			[]
		)
		.option(
			'-R, --root-element <selector>',
			'a CSS selector used to limit which part of a page is tested'
		)
		.option(
			'-E, --hide-elements <hide>',
			'a CSS selector to hide elements from testing, selectors can be comma separated'
		)
		.option(
			'-c, --config <path>',
			'a JSON or JavaScript config file',
			'./pa11y.json'
		)
		.option(
			'-t, --timeout <ms>',
			'the timeout in milliseconds',
			Number
		)
		.option(
			'-w, --wait <ms>',
			'the time to wait before running tests in milliseconds'
		)
		.option(
			'-d, --debug',
			'output debug messages'
		)
		.option(
			'-S, --screen-capture <path>',
			'a path to save a screen capture of the page to'
		)
		.option(
			'-A, --add-rule <rule>',
			'WCAG 2.0 rules to include, a repeatable value or separated by semi-colons',
			collectOptions,
			[]
		)
		.parse(process.argv);
	program.url = program.args[0];
}

async function runProgram(program) {
	if (program.environment) {
		outputEnvironmentInfo();
		process.exit(0);
	}
	if (!program.url || program.args[1]) {
		program.help();
	}
	var options = processOptions(program);
	options.log.begin(program.url);
	try {
		const pa11yReport = await pa11y(program.url, options);
		if (reportShouldFail(program.level, pa11yReport.messages, program.threshold)) {
			process.once('exit', function() {
				process.exit(2);
			});
		}
		options.log.results(pa11yReport.messages, program.url);
	} catch (error) {
		options.log.error(error.stack);
		process.exit(1);
	}
}

function processOptions(program) {
	const options = extend({}, loadConfig(program.config), {
		hideElements: program.hideElements,
		ignore: (program.ignore.length ? program.ignore : undefined),
		log: loadReporter(program.reporter),
		rootElement: program.rootElement,
		rules: (program.addRule.length ? program.addRule : undefined),
		screenCapture: program.screenCapture,
		standard: program.standard,
		timeout: program.timeout,
		wait: program.wait
	});

	if (!program.debug) {
		options.log.debug = function() {};
	}
	return options;
}

function loadConfig(filePath) {
	return requireFirst([
		filePath,
		filePath.replace(/^\.\//, process.cwd() + '/'),
		process.cwd() + '/' + filePath
	], {});
}

function loadReporter(name) {
	var reporter = requireFirst([
		'../reporter/' + name,
		'pa11y-reporter-' + name,
		path.join(process.cwd(), name)
	], null);
	if (!reporter) {
		console.error('Reporter "' + name + '" could not be found');
		process.exit(1);
	}
	return reporter;
}

function requireFirst(stack, defaultReturn) {
	if (!stack.length) {
		return defaultReturn;
	}
	try {
		return require(stack.shift());
	} catch (error) {
		return requireFirst(stack, defaultReturn);
	}
}

function reportShouldFail(level, results, threshold) {
	if (level === 'none') {
		return false;
	}
	if (level === 'notice') {
		return (results.length > threshold);
	}
	if (level === 'warning') {
		return (results.filter(isWarningOrError).length > threshold);
	}
	return (results.filter(isError).length > threshold);
}

function isError(result) {
	return (result.type === 'error');
}

function isWarningOrError(result) {
	return (result.type === 'warning' || result.type === 'error');
}

function collectOptions(val, array) {
	return array.concat(val.split(';'));
}

function outputEnvironmentInfo() {
	var versions = {
		pa11y: pkg.version,
		node: process.version.replace('v', ''),
		npm: '[unavailable]',
		os: require('os').release()
	};
	try {
		versions.npm = require('child_process').execSync('npm -v').toString().trim();
	} catch (error) {}

	console.log('Pa11y:      ' + versions.pa11y);
	console.log('Node.js:    ' + versions.node);
	console.log('npm:        ' + versions.npm);
	console.log('OS:         ' + versions.os + ' (' + process.platform + ')');
}

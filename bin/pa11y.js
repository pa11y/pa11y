#!/usr/bin/env node
'use strict';

const buildReporter = require('../lib/reporter');
const extend = require('node.extend');
const envinfo = require('envinfo');
const path = require('path');
const pkg = require('../package.json');
const {program} = require('commander');
const pa11y = require('../lib/pa11y');
const {requireFirst} = require('../lib/helpers');
const semver = require('semver');

let programOptions = {};

/**
 * Option schema defining all CLI options with metadata.
 * Used for generating grouped help and early validation.
 */
const optionSchema = [
  // Common options (all runners)
  { flags: '-r, --runner <runner>', desc: 'test runner(s): htmlcs (default), axe', type: 'string[]', runner: 'common', collect: true },
  { flags: '-c, --config <path>', desc: 'a JSON or JavaScript config file', type: 'string', runner: 'common', default: './pa11y.json' },
  { flags: '-t, --timeout <ms>', desc: 'the timeout in milliseconds', type: 'number', runner: 'common' },
  { flags: '-w, --wait <ms>', desc: 'the time to wait before running tests in milliseconds', type: 'number', runner: 'common' },
  { flags: '-d, --debug', desc: 'output debug messages', type: 'boolean', runner: 'common' },
  { flags: '-R, --root-element <selector>', desc: 'a CSS selector used to limit which part of a page is tested', type: 'string', runner: 'common' },
  { flags: '-E, --hide-elements <hide>', desc: 'a CSS selector to hide elements from testing, selectors can be comma separated', type: 'string[]', runner: 'common', collect: true },
  { flags: '-S, --screen-capture <path>', desc: 'a path to save a screen capture of the page to', type: 'string', runner: 'common' },
  { flags: '-l, --level <level>', desc: 'the level of issue to fail on (exit with code 2): error, warning, notice', type: 'string', runner: 'common' },
  { flags: '-T, --threshold <number>', desc: 'permit this number of errors, warnings, or notices, otherwise fail with exit code 2', type: 'number', runner: 'common' },
  { flags: '-i, --ignore <ignore>', desc: 'types and codes of issues to ignore, a repeatable value or separated by semi-colons', type: 'string[]', runner: 'common', collect: true },
  { flags: '--include-notices', desc: 'include notices in the report', type: 'boolean', runner: 'common' },
  { flags: '--include-warnings', desc: 'include warnings in the report', type: 'boolean', runner: 'common' },
  { flags: '--level-cap-when-needs-review <level>', desc: '(axe-only) cap severity of any issue requiring manual review to: error (default), warning, notice', type: 'string', runner: 'axe' },
  { flags: '-e, --reporter <reporter>', desc: 'the reporter to use: cli (default), csv, json', type: 'string', runner: 'common' },
  { flags: '-n, --environment', desc: 'output details about the environment Pa11y will run in', type: 'boolean', runner: 'common' },

  // htmlcs-only options
  { flags: '-s, --standard <name>', desc: 'the accessibility standard to use: WCAG2AAA (only used by htmlcs), WCAG2AA (default), or WCAG2A', type: 'string', runner: 'htmlcs' },
  { flags: '-A, --add-rule <rule>', desc: 'WCAG 2.0 rules to include, a repeatable value or separated by semi-colons – only used by htmlcs runner', type: 'string[]', runner: 'htmlcs', collect: true },
];

/**
 * Build the commander program from the option schema
 * @returns {void}
 */
function buildCommanderProgram() {
  // Add version and usage
  program.version(pkg.version).usage('[options] <url>');

  // Group options by runner for help output
  const commonOptions = optionSchema.filter(opt => opt.runner === 'common');
  const htmlcsOptions = optionSchema.filter(opt => opt.runner === 'htmlcs');
  const axeOptions = optionSchema.filter(opt => opt.runner === 'axe');

  // Add options to commander
  commonOptions.forEach(addOptionToCommander);
  htmlcsOptions.forEach(addOptionToCommander);
  axeOptions.forEach(addOptionToCommander);

  // Allow excess arguments (for URL)
  program.allowExcessArguments();

  // Custom help to show grouped output
  program.on('--help', () => {
    console.log('');
    console.log('Common options (all runners):');
    commonOptions.forEach(opt => {
      console.log(`  ${opt.flags.padEnd(30)} ${opt.desc}`);
    });
    console.log('');
    console.log('htmlcs runner options:');
    htmlcsOptions.forEach(opt => {
      console.log(`  ${opt.flags.padEnd(30)} ${opt.desc}`);
    });
    console.log('');
    console.log('axe runner options:');
    axeOptions.forEach(opt => {
      console.log(`  ${opt.flags.padEnd(30)} ${opt.desc}`);
    });
    console.log('');
  });

  program.parse(process.argv);
  program.url = program.args[0];
}

/**
 * Helper to add an option to commander based on schema definition
 * @param {Object} option - option schema definition
 * @returns {void}
 */
function addOptionToCommander(option) {
  const {flags, desc, type, collect, default: defaultValue} = option;
  
  let cmdOption = program.option(flags, desc);
  
  // Apply type-specific configurations
  if (type === 'boolean' && !collect) {
    // Boolean flags are already handled by .option()
  } else if (type === 'number' && !collect) {
    cmdOption = cmdOption.argParser(Number);
  } else if (collect) {
    // Collect options (arrays)
    cmdOption = cmdOption.argParser(val => {
      if (!Array.isArray(cmdOption)) {
        cmdOption = [];
      }
      return cmdOption.concat(val.split(';'));
    });
  }
  
  // Set default if provided
  if (defaultValue !== undefined) {
    cmdOption = cmdOption.default(defaultValue);
  }
}

/**
 * Validate CLI options against the schema
 * @param {Object} options - parsed commander options
 * @returns {Object} validated and normalized options
 * @throws {Error} if validation fails
 */
function validateCliOptions(options) {
  const validated = {};
  
  // Process each schema option
  optionSchema.forEach(schema => {
    const {flags, type, collect, runner, default: defaultValue} = schema;
    // Extract flag name (e.g., '--runner' from '-r, --runner <runner>')
    const flagMatch = flags.match(/--([^<>, ]+)/);
    if (!flagMatch) return;
    const flagName = flagMatch[1];
    const camelCaseName = flagName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    
    let value = options[camelCaseName];
    
    // Apply default if not provided
    if (value === undefined && defaultValue !== undefined) {
      value = defaultValue;
    }
    
    // Type validation and conversion
    if (value !== undefined) {
      if (type === 'number' && !collect) {
        if (isNaN(value)) {
          throw new Error(`${flags.split(',')[0].trim()} must be a number`);
        }
        value = Number(value);
      } else if (type === 'string[]' && collect) {
        if (typeof value === 'string') {
          value = value.split(';');
        } else if (!Array.isArray(value)) {
          value = [];
        }
      } else if (type === 'boolean' && !collect) {
        value = !!value;
      }
    }
    
    validated[camelCaseName] = value;
  });
  
  // Runner-specific validation
  if (validated.runner && Array.isArray(validated.runner)) {
    validated.runner.forEach(runner => {
      if (runner !== 'htmlcs' && runner !== 'axe') {
        // For custom runners, we'll let loadRunnerFile handle validation later
        // but we can at least check it's a non-empty string
        if (typeof runner !== 'string' || runner.trim() === '') {
          throw new Error('Runner name must be a non-empty string');
        }
      }
    });
  }
  
  // Standard validation (only relevant if htmlcs runner is used)
  if (validated.standard) {
    const allowedStandards = ['WCAG2A', 'WCAG2AA', 'WCAG2AAA'];
    if (!allowedStandards.includes(validated.standard)) {
      throw new Error(`Standard must be one of ${allowedStandards.join(', ')}`);
    }
  }
  
  // Reporter validation
  if (validated.reporter) {
    const allowedReporters = ['cli', 'csv', 'json', 'tsv', 'html'];
    if (!allowedReporters.includes(validated.reporter)) {
      // Could be a custom reporter - let loadReporter handle it
      if (typeof validated.reporter !== 'string' || validated.reporter.trim() === '') {
        throw new Error('Reporter name must be a non-empty string');
      }
    }
  }
  
  // Level validation
  if (validated.level) {
    const allowedLevels = ['error', 'warning', 'notice', 'none'];
    if (!allowedLevels.includes(validated.level)) {
      throw new Error(`Level must be one of ${allowedLevels.join(', ')}`);
    }
  }
  
  // Threshold validation
  if (validated.threshold !== undefined && validated.threshold < 0) {
    throw new Error('Threshold must be a non-negative number');
  }
  
  return validated;
}

/**
 * Parse the flags and arguments passed to the CLI
 * @returns {void}
 */
function configureProgram() {
  buildCommanderProgram();
  // Update programOptions after parsing
  programOptions = program.opts();
  handleHelp();
  
  // Validate options early
  try {
    const options = validateCliOptions(program.opts());
    // Update program options with validated ones
    Object.keys(options).forEach(key => {
      program[key] = options[key];
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error('Run pa11y --help to see valid options.');
    process.exit(1);
  }
}

/**
 * Handle help
 * @returns {void}
 */
function handleHelp() {
  if (!program.url || program.args[1]) {
    program.help();
  }
}

/**
 * Test the page and generate the results
 * @returns {void}
 */
async function runProgram() {
  const options = processOptions();
  const report = loadReporter(options.reporter);
  options.log = report.log;
  if (!programOptions.debug) {
    // eslint-disable-next-line no-empty-function
    options.log.debug = () => {};
  }
  await report.begin(program.url);
  try {
    const results = await pa11y(program.url, options);
    if (reportShouldFail(options.level, results.issues, options.threshold)) {
      process.once('exit', () => {
        process.exit(2);
      });
    }
    await report.results(results);
  } catch (error) {
    await options.log.error(error.stack);
    process.exit(1);
  }
}

/**
 * Process options based on precedence rules.
 * CLI options take precedence over config options (which take precedence over defaults)
 * @returns {Object} An object containing all the options that have been specified
 */
function processOptions() {
  // The 'level', 'reporter', and 'threshold' defaults are given here
  //  as they are not relevant when using lib/pa11y via JavaScript
  const options = extend({
    level: 'error',
    reporter: 'cli',
    threshold: 0
  }, loadConfig(programOptions.config), {
    hideElements: programOptions.hideElements,
    ignore: (programOptions.ignore.length ? programOptions.ignore : undefined),
    includeNotices: programOptions.includeNotices,
    includeWarnings: programOptions.includeWarnings,
    level: programOptions.level,
    levelCapWhenNeedsReview: programOptions.levelCapWhenNeedsReview,
    reporter: programOptions.reporter,
    runners: (programOptions.runner.length ? programOptions.runner : undefined),
    rootElement: programOptions.rootElement,
    rules: (programOptions.addRule.length ? programOptions.addRule : undefined),
    screenCapture: programOptions.screenCapture,
    standard: programOptions.standard,
    threshold: programOptions.threshold,
    timeout: programOptions.timeout,
    wait: programOptions.wait
  });
  return options;
}

/**
 * Tries to loads a JSON config file from disk from a list of potential locations
 * @param {String} filePath - Path for the config file passed to the CLI
 * @returns {Object} A config object
 */
function loadConfig(filePath) {
  return requireFirst([
    filePath,
    filePath.replace(/^\.\//, `${process.cwd()}/`),
    `${process.cwd()}/${filePath}`
  ], {});
}

/**
 * Attempts to load a reporter from disk
 * @param {String} name - The name of the reporter, e.g. `pa11y-reporter-html`
 * @returns {void} 
 */
function loadReporter(name) {
  let reporterMethods;

  try {
    if (['json', 'cli', 'csv', 'tsv', 'html'].includes(name)) {
      reporterMethods = require(`../lib/reporters/${name}`);
    } else {
      reporterMethods = requireFirst([
        `pa11y-reporter-${name}`,
        path.join(process.cwd(), name)
      ], null);
    }
  } catch (error) {
    console.error(
      `An error occurred when loading the "${name}" reporter. ` +
      'This is not an error with Pa11y itself, please contact the creator of this reporter\n'
    );
    console.error(error.stack);
    process.exit(1);
  }

  if (!reporterMethods) {
    console.error(`Reporter "${name}" could not be found`);
    process.exit(1);
  }

  checkReporterCompatibility(name, reporterMethods.supports, pkg.version);
  return buildReporter(reporterMethods);
}

/**
 * Check if the reporter supports this version of pa11y
 * @param {String} reporterName - Name of the reporter
 * @param {String} reporterSupportString - List of supported versions, e.g. '^8.0.0'
 * @param {String} pa11yVersion - This version of pa11y
 * @returns {void}
 */
function checkReporterCompatibility(reporterName, reporterSupportString, pa11yVersion) {
  if (!reporterSupportString || !semver.satisfies(pa11yVersion, reporterSupportString)) {
    console.error(
      `Error: The installed "${reporterName}" reporter does not support ` +
      `Pa11y ${pa11yVersion}`
    );
    console.error('Please update your version of Pa11y or the reporter');
    console.error(`Reporter Support: ${reporterSupportString}`);
    console.error(`Pa11y Version:    ${pa11yVersion}`);
    process.exit(1);
  }
}

/**
 * Calculates if there are any errors to be reported (i.e. above the threshold)
 * This is used for example to return the correct status code on the CLI
 * @param {String} level - The level of reporting required (warning, notice, etc.)
 * @param {Object} results - The results found by the test
 * @param {Number} threshold - The threshold specified as acceptable
 * @returns {Number|false} The number of issues to report (truthy), or false if there are none
 */
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

/**
 * Create an array from a semicolon-separated string of options
 * @param {String} val - The string of user-specified values
 * @param {Array} array - The previous value(s), if any
 * @returns {Array} Array with the parameters passed
 */
function collectOptions(val, array) {
  return array.concat(val.split(';'));
}

/**
 * Output environment info for debugging purposes
 * @returns {Promise} - resolves a string with environment information from envinfo
 */
async function outputEnvironmentInfo() {
  const envData = await envinfo.run({
    System: ['OS', 'CPU', 'Memory', 'Shell'],
    Binaries: ['Node', 'Yarn', 'npm']
  });
  console.log(`${envData}  pa11y: ${pkg.version}\n`);
  process.exit(0);
}
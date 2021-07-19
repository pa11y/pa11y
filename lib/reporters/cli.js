'use strict';

const chalk = require('chalk');
const wordwrap = require('wordwrap');
const defaults = require('lodash/defaults');
const defaultCfg = require('../helpers/defaults');

module.exports = function cliReporter(options = {}, config = {}) {

	// Cleanup default logs
	// required to ensure the correct priority for log configuration
	// 1. programmatically or config file
	// 2. reporter options
	// 3. default
	const configLog = Object.assign({}, config.log);
	if (configLog.info === defaultCfg.log.info) {
		delete configLog.info;
	}
	if (configLog.error === defaultCfg.log.error) {
		delete configLog.error;
	}

	const log = defaults({}, configLog, options.log, defaultCfg.log);
	const wrapWidth = options.wrapWidth || config.wrapWidth || defaultCfg.wrapWidth;

	return {
		beforeAll(urls) {
			log.info(chalk.cyan.underline(`Running Pa11y on ${urls.length} URLs:`));
		},

		results(testResults, reportConfig) {
			const withinThreshold = reportConfig.threshold ?
				testResults.issues.length <= reportConfig.threshold :
				false;

			let message = ` ${chalk.cyan('>')} ${testResults.pageUrl} - `;
			if (testResults.issues.length && !withinThreshold) {
				message += chalk.red(`${testResults.issues.length} errors`);
				log.error(message);
			} else {
				message += chalk.green(`${testResults.issues.length} errors`);
				if (withinThreshold) {
					message += chalk.green(
						` (within threshold of ${reportConfig.threshold})`
					);
				}
				log.info(message);
			}
		},

		error(error, url) {
			log.error(` ${chalk.cyan('>')} ${url} - ${chalk.red('Failed to run')}`);
		},

		afterAll(report) {
			const passRatio = `${report.passes}/${report.total} URLs passed`;

			if (report.passes === report.total) {
				log.info(chalk.green(`\n✔ ${passRatio}`));
			} else {
				// Now we loop over the errors and output them with
				// word wrapping
				const wrap = wordwrap(3, wrapWidth);
				Object.keys(report.results).forEach(url => {
					if (report.results[url].length) {
						log.error(chalk.underline(`\nErrors in ${url}:`));
						report.results[url].forEach(result => {
							const redBullet = chalk.red('•');
							if (result instanceof Error) {
								log.error(`\n ${redBullet} Error: ${wrap(result.message).trim()}`);
							} else {
								const context = result.context ?
									result.context.replace(/\s+/g, ' ') :
									'[no context]';
								log.error([
									'',
									` ${redBullet} ${wrap(result.message).trim()}`,
									'',
									chalk.grey(wrap(`(${result.selector})`)),
									'',
									chalk.grey(wrap(context))
								].join('\n'));
							}
						});
					}
				});
				log.error(chalk.red(`\n✘ ${passRatio}`));
			}
		}
	};
};

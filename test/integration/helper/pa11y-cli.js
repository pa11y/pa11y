'use strict';

const extend = require('node.extend');
const spawn = require('child_process').spawn;
const path = require('path');

module.exports = runPa11yCli;
//
// const ignorableNotices = [
// 	'--ignore', 'WCAG2AA.Principle1.Guideline1_3.1_3_2.G57',
// 	'--ignore', 'WCAG2AA.Principle1.Guideline1_3.1_3_3.G96',
// 	'--ignore', 'WCAG2AA.Principle1.Guideline1_4.1_4_1.G14,G182',
// 	'--ignore', 'WCAG2AA.Principle1.Guideline1_4.1_4_4.G142',
// 	'--ignore', 'WCAG2AA.Principle2.Guideline2_2.2_2_2.SCR33,SCR22,G187,G152,G186,G191',
// 	'--ignore', 'WCAG2AA.Principle2.Guideline2_3.2_3_1.G19,G176',
// 	'--ignore', 'WCAG2AA.Principle2.Guideline2_4.2_4_1.G1,G123,G124,H69',
// 	'--ignore', 'WCAG2AA.Principle2.Guideline2_4.2_4_5.G125,G64,G63,G161,G126,G185',
// 	'--ignore', 'WCAG2AA.Principle2.Guideline2_4.2_4_6.G130,G131',
// 	'--ignore', 'WCAG2AA.Principle3.Guideline3_1.3_1_2.H58',
// 	'--ignore', 'WCAG2AA.Principle3.Guideline3_2.3_2_3.G61',
// 	'--ignore', 'WCAG2AA.Principle3.Guideline3_2.3_2_4.G197',
// 	'--ignore', 'WCAG2AA.Principle1.Guideline1_4.1_4_5.G140,C22,C30.AALevel'
// ];

function runPa11yCli(url, options = {}) {

	// Default the options
	options = extend(true, {}, {
		arguments: [],
		environment: {
			PATH: process.env.PATH
		},
		workingDirectory: path.resolve(`${__dirname}/..`)
	}, options);

	options.arguments.push(url);

	return new Promise((resolve, reject) => {
		const binPath = path.resolve(`${__dirname}/../../../bin/pa11y.js`);

		const response = {
			exitCode: '',
			json: null,
			output: '',
			stderr: '',
			stdout: ''
		};

		const pa11yProcess = spawn(binPath, options.arguments, {
			cwd: options.workingDirectory,
			env: options.environment
		});

		pa11yProcess.stdout.on('data', data => {
			response.stdout += data;
			response.output += data;
		});

		pa11yProcess.stderr.on('data', data => {
			response.stderr += data;
			response.output += data;
		});

		pa11yProcess.on('close', code => {
			response.exitCode = code;
			try {
				response.json = JSON.parse(response.stdout);
			} catch (error) {}
			resolve(response);
		});

		pa11yProcess.on('error', reject);

	});
}

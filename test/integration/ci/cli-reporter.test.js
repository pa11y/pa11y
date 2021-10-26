/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');
const fs = require('fs');
const path = require('path');

describe('pa11y-ci (with default reporter)', () => {
	before(() => {
		return global.cliCall(['--config',
			'defaults']);
	});

	it('outputs to the stdout and stderr', () => {
		assert.include(global.lastResult.stdout, 'Running Pa11y on 2 URLs');
		assert.include(global.lastResult.stderr, 'http://localhost:8090/passing-1 - Failed to run');
		assert.include(global.lastResult.stderr, 'http://localhost:8090/passing-2 - Failed to run');
		assert.include(global.lastResult.stderr, 'timed out');
	});

});

describe('pa11y-ci (with json built-in reporter)', () => {
	before(() => {
		return global.cliCall(['--config',
			'defaults', '--reporter', 'json']);
	});


	it('logs json to stdout', () => {
		let report;
		assert.doesNotThrow(() => {
			report = JSON.parse(global.lastResult.output);
		});
		assert.isObject(report);
		assert.include(Object.keys(report.results), 'http://localhost:8090/passing-1');
		assert.include(Object.keys(report.results), 'http://localhost:8090/passing-2');
	});

});

describe('pa11y-ci (with json built-in reporter and configuration)', () => {
	const reportFile = path.resolve(__dirname, './mock/config/__output__/results.json');
	before(() => {
		return global.cliCall(['--config',
			'reporters-json']);
	});

	after(() => {
		if (fs.existsSync(reportFile)) {
			fs.unlinkSync(reportFile);
		}
	});


	it('stores report in a file', () => {
		assert.equal(global.lastResult.output, '');
		let report;

		assert.ok(fs.existsSync(reportFile));

		assert.doesNotThrow(() => {
			report = JSON.parse(fs.readFileSync(reportFile, 'utf-8'));
		});
		assert.isObject(report);
		assert.include(Object.keys(report.results), 'http://localhost:8090/passing-1');
		assert.include(Object.keys(report.results), 'http://localhost:8090/passing-2');
	});

});


describe('pa11y-ci (with custom json reporter configuration)', () => {
	const reportFile = path.resolve(__dirname, './mock/config/__output__/my-results.json');
	before(() => {
		return global.cliCall(['--config',
			'reporters-custom']);
	});

	after(() => {
		if (fs.existsSync(reportFile)) {
			fs.unlinkSync(reportFile);
		}
	});


	it('stores report in a "my-results.json" file', () => {
		assert.equal(global.lastResult.output, '');
		let report;

		assert.ok(fs.existsSync(reportFile));

		assert.doesNotThrow(() => {
			report = JSON.parse(fs.readFileSync(reportFile, 'utf-8'));
		});
		assert.isObject(report);
		assert.include(Object.keys(report.results), 'http://localhost:8090/passing-1');
		assert.include(Object.keys(report.results), 'http://localhost:8090/passing-2');
	});

});


describe('pa11y-ci (with multiple reporters)', () => {
	const customReportFile = path.resolve(__dirname, './mock/config/__output__/my-results.json');
	const defaultReportFile = path.resolve(__dirname, './mock/config/__output__/default.json');
	before(() => {
		return global.cliCall(['--config',
			'reporters-multiple']);
	});

	after(() => {
		if (fs.existsSync(customReportFile)) {
			fs.unlinkSync(customReportFile);
		}
		if (fs.existsSync(defaultReportFile)) {
			fs.unlinkSync(defaultReportFile);
		}
	});


	it('stores report in a "my-results.json" file', () => {
		let report;

		assert.ok(fs.existsSync(customReportFile));

		assert.doesNotThrow(() => {
			report = JSON.parse(fs.readFileSync(customReportFile, 'utf-8'));
		});
		assert.isObject(report);
		assert.include(Object.keys(report.results), 'http://localhost:8090/passing-1');
		assert.include(Object.keys(report.results), 'http://localhost:8090/passing-2');
	});

	it('stores report in the default reporter file', () => {
		let report;

		assert.ok(fs.existsSync(defaultReportFile));

		assert.doesNotThrow(() => {
			report = JSON.parse(fs.readFileSync(defaultReportFile, 'utf-8'));
		});
		assert.isObject(report);
		assert.include(Object.keys(report.results), 'http://localhost:8090/passing-1');
		assert.include(Object.keys(report.results), 'http://localhost:8090/passing-2');
	});

	it('outputs results to console', () => {
		assert.include(global.lastResult.stdout, 'Running Pa11y on 2 URLs');
		assert.include(global.lastResult.stderr, 'http://localhost:8090/passing-1 - Failed to run');
		assert.include(global.lastResult.stderr, 'http://localhost:8090/passing-2 - Failed to run');
		assert.include(global.lastResult.stderr, 'timed out');
	});

});

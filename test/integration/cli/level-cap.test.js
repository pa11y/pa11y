/* eslint-disable no-invalid-this */
'use strict';

const assert = require('proclaim');
const runPa11yCli = require('../helper/pa11y-cli');

async function runWithAxe(levelCap, includeWarningsFlag = true) {
	const {json} = await runPa11yCli(`${global.mockWebsiteAddress}/level-cap`, {
		arguments: [
			'--runner', 'axe',
			'--reporter', 'json',
			'--include-notices',
			...includeWarningsFlag ? ['--include-warnings'] : [],
			...levelCap ? ['--level-cap-for-review-required', levelCap] : []
		]
	});
	return json;
}

function pa11yLevelForProblem(issues, problem) {
	return issues.find(({code}) => code === problem)?.type;
}

describe('CLI level cap for review required (axe-only)', function() {
	describe('with cap absent', function() {
		before(async function() {
			this.json = await runWithAxe();
		});

		it('leaves incomplete issues unaffected', function() {
			assert.equal('error', pa11yLevelForProblem(this.json, 'color-contrast'));
			assert.equal('error', pa11yLevelForProblem(this.json, 'frame-tested'));
		});

		it('leaves violations unaffected', function() {
			assert.equal('error', pa11yLevelForProblem(this.json, 'frame-title'));
			assert.equal('error', pa11yLevelForProblem(this.json, 'image-alt'));
			assert.equal('warning', pa11yLevelForProblem(this.json, 'heading-order'));
			assert.equal('notice', pa11yLevelForProblem(this.json, 'table-duplicate-name'));
		});
	});

	describe('with cap set to the maximum Pa11y severity, "error"', function() {
		before(async function() {
			this.json = await runWithAxe('error');
		});

		it('leaves incomplete issues unaffected', function() {
			assert.equal('error', pa11yLevelForProblem(this.json, 'color-contrast'));
			assert.equal('error', pa11yLevelForProblem(this.json, 'frame-tested'));
		});

		it('leaves violations unaffected', function() {
			assert.equal('error', pa11yLevelForProblem(this.json, 'frame-title'));
			assert.equal('error', pa11yLevelForProblem(this.json, 'image-alt'));
			assert.equal('warning', pa11yLevelForProblem(this.json, 'heading-order'));
			assert.equal('notice', pa11yLevelForProblem(this.json, 'table-duplicate-name'));
		});
	});

	describe('with cap set to "warning', function() {
		describe('with --include-warnings', function() {
			before(async function() {
				this.json = await runWithAxe('warning');
			});

			it('caps incomplete issues to "warning"', function() {
				assert.equal('warning', pa11yLevelForProblem(this.json, 'color-contrast'));
				assert.equal('warning', pa11yLevelForProblem(this.json, 'frame-tested'));
			});

			it('leaves violations unaffected', function() {
				assert.equal('error', pa11yLevelForProblem(this.json, 'frame-title'));
				assert.equal('error', pa11yLevelForProblem(this.json, 'image-alt'));
				assert.equal('warning', pa11yLevelForProblem(this.json, 'heading-order'));
				assert.equal('notice', pa11yLevelForProblem(this.json, 'table-duplicate-name'));
			});
		});

		describe('without --include-warnings', function() {
			before(async function() {
				this.json = await runWithAxe('warning', false);
			});

			it('discards incomplete issues', function() {
				assert.equal(3, this.json.length);
				assert.isUndefined(pa11yLevelForProblem(this.json, 'color-contrast'));
				assert.isUndefined(pa11yLevelForProblem(this.json, 'frame-tested'));
			});
		});
	});

	describe('with cap set to "notice"', function() {
		before(async function() {
			this.json = await runWithAxe('notice');
		});

		it('caps incomplete issues to "notice"', function() {
			assert.equal('notice', pa11yLevelForProblem(this.json, 'color-contrast'));
			assert.equal('notice', pa11yLevelForProblem(this.json, 'frame-tested'));
		});

		it('leaves violations unaffected', function() {
			assert.equal('error', pa11yLevelForProblem(this.json, 'frame-title'));
			assert.equal('error', pa11yLevelForProblem(this.json, 'image-alt'));
			assert.equal('warning', pa11yLevelForProblem(this.json, 'heading-order'));
			assert.equal('notice', pa11yLevelForProblem(this.json, 'table-duplicate-name'));
		});
	});
});

'use strict';

const runPa11yCli = require('../helper/pa11y-cli');

describe('CLI exit codes', () => {
	let pa11yResponse;

	describe('when Pa11y is run on a page with no errors', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/notices`);
		});

		it('exits with a code of `0`', () => {
			expect(pa11yResponse.exitCode).toEqual(0);
		});

	});

	describe('when Pa11y is run on a page with errors', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/errors`);
		});

		it('exits with a code of `2`', () => {
			expect(pa11yResponse.exitCode).toEqual(2);
		});

	});

	// An ISP may redirect an unresolvable hostname to a working page,
	// which could cause this test to fail when run locally.
	describe(`when Pa11y is run on a page that can't be loaded`, () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli('notahost');
		});

		it('exits with a code of `1`', () => {
			expect(pa11yResponse.exitCode).toEqual(1);
		});

	});

	describe('when the `--level` flag is set to "warning"', () => {

		describe('and Pa11y is run on a page with no warnings or errors', () => {

			beforeAll(async () => {
				pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/notices`, {
					arguments: [
						'--include-notices',
						'--include-warnings',
						'--level', 'warning'
					]
				});
			});

			it('exits with a code of `0`', () => {
				expect(pa11yResponse.exitCode).toEqual(0);
			});

		});

		describe('and Pa11y is run on a page with warnings', () => {

			beforeAll(async () => {
				pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/warnings`, {
					arguments: [
						'--include-notices',
						'--include-warnings',
						'--level', 'warning'
					]
				});
			});

			it('exits with a code of `2`', () => {
				expect(pa11yResponse.exitCode).toEqual(2);
			});

		});

	});

	describe('when the `level` config is set to "warning"', () => {

		describe('and Pa11y is run on a page with no warnings or errors', () => {

			beforeAll(async () => {
				pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/notices`, {
					arguments: [
						'--config', './mock/config/level-warning.json',
						'--include-notices',
						'--include-warnings'
					]
				});
			});

			it('exits with a code of `0`', () => {
				expect(pa11yResponse.exitCode).toEqual(0);
			});

		});

		describe('and Pa11y is run on a page with warnings', () => {

			beforeAll(async () => {
				pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/warnings`, {
					arguments: [
						'--config', './mock/config/level-warning.json',
						'--include-notices',
						'--include-warnings'
					]
				});
			});

			it('exits with a code of `2`', () => {
				expect(pa11yResponse.exitCode).toEqual(2);
			});

		});

	});

	describe('when the `level` config is set to "warning" but the `--level` flag is set to "notice"', () => {

		describe('and Pa11y is run on a page with no notices, warnings, or errors', () => {

			beforeAll(async () => {
				pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/notices`, {
					arguments: [
						'--config', './mock/config/level-warning.json',
						'--include-notices',
						'--include-warnings',
						'--level', 'notice',
						// We can't build a page that doesn't include notices, so we have
						// to fake it by ignoring all the notices
						'--ignore', 'WCAG2AA.Principle1.Guideline1_3.1_3_2.G57',
						'--ignore', 'WCAG2AA.Principle1.Guideline1_3.1_3_3.G96',
						'--ignore', 'WCAG2AA.Principle1.Guideline1_3.1_3_4.',
						'--ignore', 'WCAG2AA.Principle1.Guideline1_4.1_4_1.G14,G182',
						'--ignore', 'WCAG2AA.Principle1.Guideline1_4.1_4_10.C32,C31,C33,C38,SCR34,G206',
						'--ignore', 'WCAG2AA.Principle1.Guideline1_4.1_4_11.G195,G207,G18,G145,G174,F78',
						'--ignore', 'WCAG2AA.Principle1.Guideline1_4.1_4_12.C36,C35',
						'--ignore', 'WCAG2AA.Principle1.Guideline1_4.1_4_13.F95',
						'--ignore', 'WCAG2AA.Principle1.Guideline1_4.1_4_4.G142',
						'--ignore', 'WCAG2AA.Principle1.Guideline1_4.1_4_5.G140,C22,C30.AALevel',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_1.2_1_4.',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_2.2_2_2.SCR33,SCR22,G187,G152,G186,G191',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_3.2_3_1.G19,G176',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_4.2_4_1.G1,G123,G124,H69',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_4.2_4_5.G125,G64,G63,G161,G126,G185',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_4.2_4_6.G130,G131',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_5.2_5_1.',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_5.2_5_2.',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_5.2_5_3.F96',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_5.2_5_4.',
						'--ignore', 'WCAG2AA.Principle3.Guideline3_1.3_1_2.H58',
						'--ignore', 'WCAG2AA.Principle3.Guideline3_2.3_2_3.G61',
						'--ignore', 'WCAG2AA.Principle3.Guideline3_2.3_2_4.G197',
						'--ignore', 'WCAG2AA.Principle4.Guideline4_1.4_1_3.'
					]
				});
			});

			it('exits with a code of `0`', () => {
				expect(pa11yResponse.exitCode).toEqual(0);
			});

		});

		describe('and Pa11y is run on a page with notices', () => {

			beforeAll(async () => {
				pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/notices`, {
					arguments: [
						'--config', './mock/config/level-warning.json',
						'--include-notices',
						'--include-warnings',
						'--level', 'notice'
					]
				});
			});

			it('exits with a code of `2`', () => {
				expect(pa11yResponse.exitCode).toEqual(2);
			});

		});

	});

	describe('when the `--level` flag is set to "notice"', () => {

		describe('and Pa11y is run on a page with no notices, warnings, or errors', () => {

			beforeAll(async () => {
				pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/notices`, {
					arguments: [
						'--include-notices',
						'--include-warnings',
						'--level', 'notice',
						// We can't build a page that doesn't include notices, so we have
						// to fake it by ignoring all the notices
						'--ignore', 'WCAG2AA.Principle1.Guideline1_3.1_3_2.G57',
						'--ignore', 'WCAG2AA.Principle1.Guideline1_3.1_3_3.G96',
						'--ignore', 'WCAG2AA.Principle1.Guideline1_3.1_3_4.',
						'--ignore', 'WCAG2AA.Principle1.Guideline1_4.1_4_1.G14,G182',
						'--ignore', 'WCAG2AA.Principle1.Guideline1_4.1_4_10.C32,C31,C33,C38,SCR34,G206',
						'--ignore', 'WCAG2AA.Principle1.Guideline1_4.1_4_11.G195,G207,G18,G145,G174,F78',
						'--ignore', 'WCAG2AA.Principle1.Guideline1_4.1_4_12.C36,C35',
						'--ignore', 'WCAG2AA.Principle1.Guideline1_4.1_4_13.F95',
						'--ignore', 'WCAG2AA.Principle1.Guideline1_4.1_4_4.G142',
						'--ignore', 'WCAG2AA.Principle1.Guideline1_4.1_4_5.G140,C22,C30.AALevel',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_1.2_1_4.',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_2.2_2_2.SCR33,SCR22,G187,G152,G186,G191',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_3.2_3_1.G19,G176',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_4.2_4_1.G1,G123,G124,H69',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_4.2_4_5.G125,G64,G63,G161,G126,G185',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_4.2_4_6.G130,G131',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_5.2_5_1.',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_5.2_5_2.',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_5.2_5_3.F96',
						'--ignore', 'WCAG2AA.Principle2.Guideline2_5.2_5_4.',
						'--ignore', 'WCAG2AA.Principle3.Guideline3_1.3_1_2.H58',
						'--ignore', 'WCAG2AA.Principle3.Guideline3_2.3_2_3.G61',
						'--ignore', 'WCAG2AA.Principle3.Guideline3_2.3_2_4.G197',
						'--ignore', 'WCAG2AA.Principle4.Guideline4_1.4_1_3.'
					]
				});
			});

			it('exits with a code of `0`', () => {
				expect(pa11yResponse.exitCode).toEqual(0);
			});

		});

		describe('and Pa11y is run on a page with notices', () => {

			beforeAll(async () => {
				pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/notices`, {
					arguments: [
						'--include-notices',
						'--include-warnings',
						'--level', 'notice'
					]
				});
			});

			it('exits with a code of `2`', () => {
				expect(pa11yResponse.exitCode).toEqual(2);
			});

		});

	});

	describe('when the `threshold` config is set to more than the number of errors present', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/many-errors`, {
				arguments: [
					'--config', './mock/config/threshold-large.json',
					'--include-notices',
					'--include-warnings'
				]
			});
		});

		it('exits with a code of `0`', () => {
			expect(pa11yResponse.exitCode).toEqual(0);
		});

	});

	describe('when the `threshold` config is set to less than the number of errors present but the `--threshold` flag is set to more', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/many-errors`, {
				arguments: [
					'--config', './mock/config/threshold-small.json',
					'--include-notices',
					'--include-warnings',
					'--threshold', '5'
				]
			});
		});

		it('exits with a code of `0`', () => {
			expect(pa11yResponse.exitCode).toEqual(0);
		});

	});

	describe('when the `--threshold` flag is set to more than the number of errors present', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/many-errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--threshold', '5'
				]
			});
		});

		it('exits with a code of `0`', () => {
			expect(pa11yResponse.exitCode).toEqual(0);
		});

	});

	describe('when the `--threshold` flag is set to exactly the number of errors present', () => {

		beforeAll(async () => {
			pa11yResponse = await runPa11yCli(`${global.mockWebsiteAddress}/many-errors`, {
				arguments: [
					'--include-notices',
					'--include-warnings',
					'--threshold', '4'
				]
			});
		});

		it('exits with a code of `0`', () => {
			expect(pa11yResponse.exitCode).toEqual(0);
		});

	});

});

/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');
const path = require('path');

describe('lib/helpers/loader', () => {
	describe('loadReporter', () => {

		before(() => {
			sinon.stub(console, 'log');
		});

		after(() => {
			console.log.restore();
		});

		it('resolves npm modules', () => {
			const loadReporter = require('../../../lib/helpers/loader');
			const mock = {};
			mockery.registerMock('my-reporter', mock);
			const reporter = loadReporter('my-reporter');

			assert.equal(reporter, mock);
		});

		it('resolves local modules', () => {
			const mock = {};
			mockery.registerMock('fs', {
				existsSync: () => true
			});
			const loadReporter = require('../../../lib/helpers/loader');

			mockery.registerMock(path.join(process.cwd(), '/my-reporter.js'), mock);
			const reporter = loadReporter('my-reporter.js');

			assert.equal(reporter, mock);

		});

		it('returns undefined if module is not resolved', () => {
			const loadReporter = require('../../../lib/helpers/loader');

			const reporter = loadReporter('my-reporter.js');

			assert.isUndefined(reporter);
		});

	});
});

/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/helpers/resolver', () => {
	describe('resolveReporters', () => {
		const mock = {};
		let config;
		let stubReporter;

		beforeEach(() => {
			config = {reporters: ['my-reporter']};
			stubReporter = sinon.stub().returns(mock);
			mockery.registerMock('my-reporter', stubReporter);
		});

		it('returns an empty array for non-array and empty array argument', () => {
			const resolveReporters = require('../../../lib/helpers/resolver');

			assert.deepEqual(resolveReporters({reporters: []}), []);
			assert.deepEqual(resolveReporters({reporters: ''}), []);
		});

		it('omits non-string values', () => {
			const resolveReporters = require('../../../lib/helpers/resolver');
			const reporters = resolveReporters({reporters: [false, null, undefined]});
			assert.equal(reporters.length, 0);
		});

		it('calls loadReporter', () => {
			const loadStub = sinon.stub();
			mockery.registerMock('./loader', loadStub);
			const resolveReporters = require('../../../lib/helpers/resolver');
			const mock1 = {mock1: true};
			const mock2 = {mock2: true};
			loadStub.onCall(0).returns(mock1);
			loadStub.onCall(1).returns(mock2);

			const reporters = resolveReporters({reporters: ['my-reporter1', 'my-reporter2']});

			assert.equal(reporters[0], mock1);
			assert.equal(reporters[1], mock2);
			assert.calledWith(loadStub.getCall(0), 'my-reporter1');
			assert.calledWith(loadStub.getCall(1), 'my-reporter2');
		});

		it('resolves included reporters with shorthand notation', () => {
			const includedReporters = ['cli', 'json'];
			const reporterPath = '../../../lib/reporters';
			const includedReportersResolved = [require.resolve(`${reporterPath}/cli.js`),
				require.resolve(`${reporterPath}/json.js`)];
			const loaderStub = sinon.stub();
			mockery.registerMock('./loader', loaderStub);
			const resolveReporters = require('../../../lib/helpers/resolver');

			resolveReporters({reporters: includedReporters});

			assert.calledWith(loaderStub.getCall(0), includedReportersResolved[0]);
			assert.calledWith(loaderStub.getCall(1), includedReportersResolved[1]);
		});

		it('accepts reporters as factory functions', () => {
			const resolveReporters = require('../../../lib/helpers/resolver');
			const reporters = resolveReporters(config);
			assert.called(stubReporter);
			assert.deepEqual(reporters, [mock]);
		});

		it('factory functions get called with reporter options and config', () => {
			const reporterOptions = {myOption: true};
			config.reporters = [
				['my-reporter', reporterOptions]
			];

			const resolveReporters = require('../../../lib/helpers/resolver');
			resolveReporters(config);
			assert.calledWith(stubReporter, reporterOptions, config);
		});

		it('reporter options default to an empty object', () => {
			const resolveReporters = require('../../../lib/helpers/resolver');
			resolveReporters(config);
			assert.calledWith(stubReporter, {}, config);
		});
	});
});

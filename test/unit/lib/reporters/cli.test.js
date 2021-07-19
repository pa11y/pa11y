/* eslint max-len: 'off' */
'use strict';

const assert = require('proclaim');
const sinon = require('sinon');
const cli = require('../../../../lib/reporters/cli');
const defaults = require('../../../../lib/helpers/defaults');

describe('reporters/cli', () => {
	const log = {
		info: sinon.stub(),
		error: sinon.stub()
	};

	it('exports a factory function', () => {
		assert.isFunction(cli);

		sinon.assert.match(cli(), {
			beforeAll: sinon.match.func,
			error: sinon.match.func,
			results: sinon.match.func,
			afterAll: sinon.match.func
		});
	});

	it('non-default config log methods have precedence', () => {
		const options = {
			log: {
				info: () => undefined,
				error: () => undefined
			}
		};
		const config = {
			log
		};
		const reporter = cli(options, config);

		reporter.beforeAll([]);
		reporter.error('error', '/');

		assert.called(log.info);
		assert.called(log.error);

	});

	it('default config log methods are overridden by options', () => {
		const options = {
			log: {
				info: sinon.stub(),
				error: sinon.stub()
			}
		};

		sinon.spy(defaults.log, 'info');
		sinon.spy(defaults.log, 'error');
		const config = {
			log: defaults.log
		};
		const reporter = cli(options, config);

		reporter.beforeAll([]);
		reporter.error('error', '/');

		assert.notCalled(config.log.info);
		assert.notCalled(config.log.error);
		assert.called(options.log.info);
		assert.called(options.log.error);

	});
});

'use strict';

const startMockWebsite = require('./mock/website');

module.exports = {
	mochaHooks: {
		async beforeAll() {
			global.mockWebsite = await startMockWebsite();
			global.mockWebsiteAddress = `http://127.0.0.1:${global.mockWebsite.address().port}`;
		},
		afterAll() {
			global.mockWebsite.close();
			delete global.mockWebsite;
			delete global.mockWebsiteAddress;
		}
	}
};

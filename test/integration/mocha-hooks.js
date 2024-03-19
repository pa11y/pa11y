'use strict';

const startMockWebsite = require('./mock/website');

module.exports = {
	mochaHooks: {
		async beforeAll() {
			global.mockWebsite = await startMockWebsite();
			global.mockWebsiteAddress = `http://localhost:${global.mockWebsite.address().port}`;
		},
		afterAll() {
			global.mockWebsite.close();
			delete global.mockWebsite;
			delete global.mockWebsiteAddress;
		}
	}
};

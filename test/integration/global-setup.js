'use strict';

const startMockWebsite = require('./mock/website');

module.exports = async () => {
	global.mockWebsite = await startMockWebsite(process.env.MOCK_SERVER_PORT);
	// 		Global.mockWebsiteAddress = `http://localhost:${global.SERVER_PORT}`;
};

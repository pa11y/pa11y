'use strict';

const startMockWebsite = require('./mock/website');

// Set here because this runs before setup-env and is require to start server.
// Saved as environment variable for use in setup-env in case not set.
process.env.MOCK_SERVER_PORT = process.env.MOCK_SERVER_PORT || 8081;

module.exports = async () => {
	global.mockWebsite = await startMockWebsite(process.env.MOCK_SERVER_PORT);
	// 		Global.mockWebsiteAddress = `http://localhost:${global.SERVER_PORT}`;
};

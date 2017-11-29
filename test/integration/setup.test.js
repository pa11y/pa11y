'use strict';

const startMockWebsite = require('./mock/website');

before(async () => {
	global.mockWebsite = await startMockWebsite();
	global.mockWebsiteAddress = `http://localhost:${global.mockWebsite.address().port}`;
});

after(() => {
	global.mockWebsite.close();
	delete global.mockWebsite;
	delete global.mockWebsiteAddress;
});

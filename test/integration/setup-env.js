'use strict';

jest.setTimeout(10000);
global.mockWebsiteAddress = `http://localhost:${process.env.MOCK_SERVER_PORT}`;

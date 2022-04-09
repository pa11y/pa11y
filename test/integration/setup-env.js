'use strict';

jest.setTimeout(20000);
global.mockWebsiteAddress = `http://localhost:${process.env.MOCK_SERVER_PORT}`;

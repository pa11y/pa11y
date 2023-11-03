'use strict';

jest.setTimeout(40000);
global.mockWebsiteAddress = `http://localhost:${process.env.MOCK_SERVER_PORT}`;

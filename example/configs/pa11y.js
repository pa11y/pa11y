'use strict';

// Example pa11y config with values set via environment variables
module.exports = {
	headers: {
		Cookie: 'foo=bar'
	},
	includeWarnings: process.env.INCLUDE_WARNINGS === 'true'
};

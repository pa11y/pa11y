'use strict';

function groupResponses(pa11yResponses) {
	return pa11yResponses.reduce((acc, curr) => {
		acc[curr.type].push(curr);
		return acc;
	}, {
		warning: [],
		error: [],
		notice: []
	});
}

module.exports = {
	groupResponses
};

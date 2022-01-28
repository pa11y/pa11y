'use strict';

module.exports = () => {
	return new Promise(resolve => {
		if (global.mockWebsite) {
			global.mockWebsite.close(resolve);
		} else {
			resolve();
		}
	});
};

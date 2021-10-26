'use strict';

const path = require('path');
const fs = require('fs');

module.exports = function loadReporter(reporter) {
	try {
		return require(reporter);
	} catch (_) {
		const localModule = path.resolve(process.cwd(), reporter);
		if (!fs.existsSync(localModule)) {
			console.error(`Unable to load reporter "${reporter}"`);
			return undefined;
		}
		return require(localModule);
	}
};

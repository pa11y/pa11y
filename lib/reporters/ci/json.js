'use strict';

const fs = require('fs');
const {resolve, isAbsolute, dirname} = require('path');

function writeReport(fileName, data) {
	try {
		const dirPath = dirname(fileName);
		if (!(fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory())) {
			fs.mkdirSync(dirPath, {recursive: true});
		}
		fs.writeFileSync(fileName, data);
	} catch (error) {
		console.error(`Unable to write ${fileName}`);
		console.error(error);
	}
}

function resolveFile(fileName) {
	if (typeof fileName !== 'string') {
		return null;
	}
	return isAbsolute(fileName) ? fileName : resolve(process.cwd(), fileName);
}

module.exports = function jsonReporter(options = {}) {
	const fileName = resolveFile(options.fileName);
	return {
		afterAll(report) {
			const jsonString = JSON.stringify(report, (key, value) => {
				if (value instanceof Error) {
					return {message: value.message};
				}
				return value;
			});

			// If reporter options specify an output file, write to file.
			// Otherwise, write to console for backwards compatibility with
			// previous --json CLI option.
			if (fileName) {
				writeReport(fileName, jsonString);
			} else {
				console.log(jsonString);
			}
		}
	};
};

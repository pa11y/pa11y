'use strict';

const fs = require('fs');
const {resolve, dirname} = require('path');

module.exports = ({fileName = './__output__/default.json'}) => ({
	afterAll(report) {
		if (fileName) {
			const filePath = resolve(process.cwd(), fileName);
			fs.mkdirSync(dirname(filePath), {recursive: true});
			fs.writeFileSync(filePath, JSON.stringify(report), 'utf8');
		}
	}
});

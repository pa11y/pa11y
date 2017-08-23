
const fs = require('fs');

module.exports = {
	begin: emptyFunction,
	error: reportError,
	debug: emptyFunction,
	info: emptyFunction,
	results: reportResults,
	process: buildHtml
};

function emptyFunction() {}

function reportError(message) {
	console.error(message);
}

function reportResults(results, url) {
	console.log(buildHtml(results, url));
}

function buildHtml(results, url) {
	const renderMain = template(`${__dirname}/html/report.html`);
	return renderMain({
		date: new Date(),
		errorCount: results.filter(isError).length,
		warningCount: results.filter(isWarning).length,
		noticeCount: results.filter(isNotice).length,
		results: buildResultsHtml(results),
		url
	});
}

function buildResultsHtml(results) {
	const renderResult = template(`${__dirname}/html/result.html`);
	return results.map(result => {
		result.typeLabel = upperCaseFirst(result.type);
		return renderResult(result);
	}).join('');
}

function template(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8');
	return function(context) {
		let output = content;
		Object.keys(context).forEach(key => {
			output = output.replace(new RegExp(`\\{${key}\\}`, 'g'), escapeHtml(context[key]));
			output = output.replace(new RegExp(`\\{${key}\\|raw\\}`, 'g'), context[key]);
		});
		return output.replace(/\s+/g, ' ').trim();
	};
}

function upperCaseFirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function escapeHtml(html) {
	return String(html)
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function isError(result) {
	return (result.type === 'error');
}

function isNotice(result) {
	return (result.type === 'notice');
}

function isWarning(result) {
	return (result.type === 'warning');
}

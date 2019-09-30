const assert = require('proclaim');
const pa11y = require('../../lib/pa11y');

const TIMEOUT = 15000;

async function runTest(url) {
	try {
		const result = await pa11y(url);
		assert.isObject(result);
	} catch (error) {
		assert.fail(`Expected no error but pa11y threw an exception with message: "${error.message}"`);
	}
}

describe('Pa11y runs without failure', () => {
	it('runs on https://www.nature.com/', async () => {
		await runTest('https://www.nature.com/');
	}).timeout(TIMEOUT);

	it('runs on https://google.com/', async () => {
		await runTest('https://www.nature.com/');
	}).timeout(TIMEOUT);

	it('runs on https://www.dundee.ac.uk', async () => {
		await runTest('https://www.dundee.ac.uk');
	}).timeout(TIMEOUT);

	it('runs on https://link.springer.com', async () => {
		await runTest('https://link.springer.com');
	}).timeout(TIMEOUT);

	it('runs on https://www.bbc.co.uk', async () => {
		await runTest('https://www.bbc.co.uk');
	}).timeout(TIMEOUT);
});

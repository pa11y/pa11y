const assert = require('proclaim');
const pa11y = require('../../lib/pa11y');

async function runTest(url) {
	try {
		const result = await pa11y(url);
		assert.isObject(result);
	} catch (error) {
		assert.fail(`Expected no error but got "${error.message}"`);
	}
}

describe('sanity checks', () => {

	it('runs on https://www.nature.com/', async () => {
		await runTest('https://www.nature.com/');
	}).timeout(10000);

	it('runs on https://google.com/', async () => {
		await runTest('https://www.nature.com/');
	}).timeout(10000);

	it('runs on http://culturaestero.regione.emilia-romagna.it/it', async () => {
		await runTest('http://culturaestero.regione.emilia-romagna.it/it');
	}).timeout(10000);

	it('runs on https://www.dundee.ac.uk', async () => {
		await runTest('https://www.dundee.ac.uk');
	}).timeout(10000);

	it('runs on https://link.springer.com', async () => {
		await runTest('https://link.springer.com');
	}).timeout(10000);

	it('runs on https://www.bbc.co.uk', async () => {
		await runTest('https://www.bbc.co.uk');
	}).timeout(10000);
});

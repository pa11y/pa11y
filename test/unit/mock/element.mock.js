'use strict';

const sinon = require('sinon');

module.exports = createMockElement;

function createMockElement(data = {}) {
	const element = Object.assign({
		addEventListener: sinon.stub(),
		childNodes: [],
		contains: sinon.stub().returns(false),
		dispatchEvent: sinon.stub(),
		getClientRects: sinon.stub().returns([]),
		id: null,
		innerHTML: 'mock-html',
		isEqualNode: sinon.stub().returns(false),
		nodeType: 1,
		offsetHeight: 0,
		offsetWidth: 0,
		outerHTML: '<element>mock-html</element>',
		parentNode: null,
		tagName: 'ELEMENT'
	}, data);

	if (element.parentNode) {
		element.parentNode.childNodes.push(element);
	}
	if (element.childNodes.length) {
		element.childNodes.forEach(childNode => {
			childNode.parentNode = element;
		});
	}

	return element;
}

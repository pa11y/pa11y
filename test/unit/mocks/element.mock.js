'use strict';

const sinon = require('sinon');

module.exports = {
	createMockElement,
	createMockPrototypeElement
};


const initMockElementProperties = function() {
	return {
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
	};
};

function MockElement() {
	Object.assign(this, initMockElementProperties());
}

MockElement.prototype = {
	set value(value) {
		this.elementValue = value;
	},
	get value() {
		return this.elementValue;
	}
};

function connectToDOM(element) {
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

function createMockPrototypeElement(data = {}) {
	const element = Object.assign(new MockElement(), data);
	return connectToDOM(element);
}

function createMockElement(data = {}) {
	const element = Object.assign(initMockElementProperties(), data);
	return connectToDOM(element);
}

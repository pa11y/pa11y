'use strict';

module.exports = {
	createMockElement,
	createMockPrototypeElement
};

const initMockElementProperties = () => {
	return {
		addEventListener: jest.fn(),
		childNodes: [],
		contains: jest.fn().mockReturnValue(false),
		dispatchEvent: jest.fn(),
		getClientRects: jest.fn().mockReturnValue([]),
		id: null,
		innerHTML: 'mock-html',
		isEqualNode: jest.fn().mockReturnValue(false),
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

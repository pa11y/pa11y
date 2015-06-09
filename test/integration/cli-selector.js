// This file is part of pa11y.
//
// pa11y is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// pa11y is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with pa11y.  If not, see <http://www.gnu.org/licenses/>.

// jshint maxstatements: false
// jscs:disable maximumLineLength
'use strict';

var assert = require('proclaim');
var describeCliCall = require('./helper/describe-cli-call');

describe('Pa11y CLI Basic', function () {

	describeCliCall('/selectors', [], {}, function () {

		it('should respond with an exit code of `2`', function () {
			assert.strictEqual(this.lastExitCode, 2);
		});

		it('should respond with the expected messages', function () {
			assert.isArray(this.lastJsonResponse);
			assert.lengthEquals(this.lastJsonResponse, 5);
			assert.deepEqual(this.lastJsonResponse[0], {
				code: 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2',
				context: '<title>Page Title</title>',
				message: 'Check that the title element describes the document.',
				selector: 'html > head > title',
				type: 'notice',
				typeCode: 3
			});
			assert.deepEqual(this.lastJsonResponse[1], {
				code: 'WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2',
				context: '<html><head>\n\n    <meta charset="utf-...</html>',
				message: 'The html element should have a lang or xml:lang attribute which describes the language of the document.',
				selector: 'html',
				type: 'error',
				typeCode: 1
			});
			assert.deepEqual(this.lastJsonResponse[2], {
				code: 'WCAG2AA.Principle1.Guideline1_3.1_3_1.H49.B',
				context: '<b>World</b>',
				message: 'Semantic markup should be used to mark emphasised or special text so that it can be programmatically determined.',
				selector: 'html > body > p:nth-child(1) > b',
				type: 'warning',
				typeCode: 2
			});
			assert.deepEqual(this.lastJsonResponse[3], {
				code: 'WCAG2AA.Principle1.Guideline1_3.1_3_1.H49.B',
				context: '<b>foo</b>',
				message: 'Semantic markup should be used to mark emphasised or special text so that it can be programmatically determined.',
				selector: '#foo > b',
				type: 'warning',
				typeCode: 2
			});
			assert.deepEqual(this.lastJsonResponse[4], {
				code: 'WCAG2AA.Principle1.Guideline1_3.1_3_1.H49.B',
				context: '<b id="bar">bar</b>',
				message: 'Semantic markup should be used to mark emphasised or special text so that it can be programmatically determined.',
				selector: '#bar',
				type: 'warning',
				typeCode: 2
			});
		});

	});

});

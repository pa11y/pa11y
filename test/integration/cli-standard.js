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

describe('Pa11y CLI Standard', function () {

	describeCliCall('/notices', ['--standard', 'Section508'], {}, function () {

		it('should respond with an exit code of `0`', function () {
			assert.strictEqual(this.lastExitCode, 0);
		});

		it('should respond with the expected messages', function () {
			assert.isArray(this.lastJsonResponse);
			assert.lengthEquals(this.lastJsonResponse, 0);
		});

	});

	describeCliCall('/notices', ['--standard', 'WCAG2A'], {}, function () {

		it('should respond with an exit code of `0`', function () {
			assert.strictEqual(this.lastExitCode, 0);
		});

		it('should respond with the expected messages', function () {
			assert.isArray(this.lastJsonResponse);
			assert.lengthEquals(this.lastJsonResponse, 1);
			assert.deepEqual(this.lastJsonResponse[0], {
				code: 'WCAG2A.Principle2.Guideline2_4.2_4_2.H25.2',
				context: '<title>Page Title</title>',
				message: 'Check that the title element describes the document.',
				selector: 'html > head > title',
				type: 'notice',
				typeCode: 3
			});
		});

	});

	describeCliCall('/notices', ['--standard', 'WCAG2AA'], {}, function () {

		it('should respond with an exit code of `0`', function () {
			assert.strictEqual(this.lastExitCode, 0);
		});

		it('should respond with the expected messages', function () {
			assert.isArray(this.lastJsonResponse);
			assert.lengthEquals(this.lastJsonResponse, 1);
			assert.deepEqual(this.lastJsonResponse[0], {
				code: 'WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.2',
				context: '<title>Page Title</title>',
				message: 'Check that the title element describes the document.',
				selector: 'html > head > title',
				type: 'notice',
				typeCode: 3
			});
		});

	});

	describeCliCall('/notices', ['--standard', 'WCAG2AAA'], {}, function () {

		it('should respond with an exit code of `0`', function () {
			assert.strictEqual(this.lastExitCode, 0);
		});

		it('should respond with the expected messages', function () {
			assert.isArray(this.lastJsonResponse);
			assert.lengthEquals(this.lastJsonResponse, 1);
			assert.deepEqual(this.lastJsonResponse[0], {
				code: 'WCAG2AAA.Principle2.Guideline2_4.2_4_2.H25.2',
				context: '<title>Page Title</title>',
				message: 'Check that the title element describes the document.',
				selector: 'html > head > title',
				type: 'notice',
				typeCode: 3
			});
		});

	});

	describeCliCall('/notices', ['--config', './mock/config/standard.json'], {}, function () {

		it('should respond with an exit code of `0`', function () {
			assert.strictEqual(this.lastExitCode, 0);
		});

		it('should respond with the expected messages', function () {
			assert.isArray(this.lastJsonResponse);
			assert.lengthEquals(this.lastJsonResponse, 0);
		});

	});

});

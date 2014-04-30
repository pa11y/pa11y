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

module.exports = function (grunt) {

	grunt.initConfig({

		jshint: {
			all: ['bin/pa11y', 'Gruntfile.js', 'lib/**/*.js', 'test/**/*.js'],
			options: {
				es3: false,
				indent: 4,
				latedef: false,
				maxcomplexity: 5,
				maxdepth: 2,
				maxlen: 100,
				maxparams: 4,
				maxstatements: 12,
				node: true,
				quotmark: 'single'
			}
		},

		mochaTest: {
			unit: {
				src: ['test/unit/**/*.js'],
				options: {
					reporter: 'spec'
				}
			},
			functional: {
				src: ['test/functional/*.js'],
				options: {
					reporter: 'spec',
					timeout: 4000
				}
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-test');

	grunt.registerTask('lint', ['jshint']);
	grunt.registerTask('test', ['mochaTest']);
	grunt.registerTask('default', ['lint', 'test']);
	grunt.registerTask('ci', ['lint', 'mochaTest:unit']);

};
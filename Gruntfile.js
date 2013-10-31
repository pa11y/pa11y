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
					reporter: 'spec'
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
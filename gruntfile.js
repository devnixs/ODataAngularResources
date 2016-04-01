module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      options: {
        livereload: true,
        debounceDelay: 10,
        spawn: false,
      },
      src: {
        files: [
          'src/*.*',
        ],
        tasks: ['build']
      },
      tests: {
        files: [
          'specs/**/*.js',
        ],
        tasks: []
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
      },
      all: {
        src: [
          "src/*.js"
        ]
      },
      test: {
        src: [
          'specs/*.js'
        ]
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      app: {
        src: [
          "src/app.js",
          "src/odataoperators.js",
          "src/odatavalue.js",
          "src/odataproperty.js",
          "src/odatabinaryoperation.js",
		  "src/odataexpandpredicate.js",
          "src/odatamethodcall.js",
          "src/odataorderbystatement.js",
          "src/odatapredicate.js",
          "src/odataprovider.js",
          "src/odataresources.js",
          "src/odata.js",
        ],
        dest: 'build/odataresources.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'build/odataresources.js',
        dest: 'build/odataresources.min.js'
      }
    },
    coveralls: {
      // Options relevant to all targets
      options: {
        // When true, grunt-coveralls will only print a warning rather than
        // an error, to prevent CI builds from failing unnecessarily (e.g. if
        // coveralls.io is down). Optional, defaults to false.
        force: false
      },

      your_target: {
        // LCOV coverage file (can be string, glob or array)
        src: 'coverage/lcov.info',
        options: {
          // Any options for just this target
        }
      },
    },
    jasmine: {
      cover: {
        src: [
          'build/odataresources.js'
        ],
        options: {
          keepRunner: true,
          specs: 'specs/*.js',
          vendor: [
            'specs/dependencies/angular.js',
            'specs/dependencies/angular-mocks.js',
            'specs/dependencies/matchers.js',
            'specs/dependencies/configuration.js',
          ],
          template: require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            coverage: 'coverage/coverage.json',
            thresholds: {
              lines: 75,
              statements: 75,
              branches: 75,
              functions: 90
            },
            report: {
              type: 'lcov',
              options: {
                dir: 'coverage/'
              }
            }
          }
        }
      },
      pivotal: {
        src: [
          'build/odataresources.js'
        ],
        options: {
          keepRunner: true,
          specs: 'specs/*.js',
          vendor: [
            'specs/dependencies/angular.js',
            'specs/dependencies/angular-mocks.js',
            'specs/dependencies/matchers.js',
            'specs/dependencies/configuration.js',
          ]
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-coveralls');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'jasmine:pivotal']);
  grunt.registerTask('build', ['concat', 'uglify']);
  grunt.registerTask('test', ['jshint', 'jasmine:pivotal']);
  grunt.registerTask('testandcover', ['jshint', 'jasmine:cover', 'coveralls']);

};
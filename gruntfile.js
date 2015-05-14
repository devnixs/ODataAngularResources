module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
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
    jasmine: {
      pivotal: {
        src: [
          'build/odataresources.js'
        ],
        options: {
          specs: 'specs/*.js',
          vendor : [
          'specs/dependencies/angular.js',
          'specs/dependencies/angular-mocks.js',
          'specs/dependencies/matchers.js',
          'specs/dependencies/configuration.js',
          ],
        }
      }
    },
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'concat', 'uglify','jasmine']);

};
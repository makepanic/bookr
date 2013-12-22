module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    var bookrConfig = {
        src: 'src',
        test: 'test'
    };

    // Project configuration.
    grunt.initConfig({
        bookr: bookrConfig,
        pkg: grunt.file.readJSON('package.json'),

        eslint: {
            target: [
                '<%= bookr.src %>/**/*.js',
                //'!<%= bookr.src%>/intro.js',
            ],
            options: {
                config: 'eslint.json'
            }
        },

        // @see https://github.com/caolan/nodeunit
        nodeunit: {
            all: ['<%= bookr.test %>/**/*.test.js']
        }
    });


    // Default task(s).
    grunt.registerTask('default', ['eslint']);

    // test task
    grunt.registerTask('test', ['eslint', 'nodeunit']);
};
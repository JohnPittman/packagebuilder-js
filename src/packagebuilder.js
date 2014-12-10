'use strict'

var uglify = require('gulp-uglify');
var jasmine = require('gulp-jasmine');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var sourcemaps = require('gulp-sourcemaps');
var prompt = require('gulp-prompt');
var recursiveread = require('recursive-readdir');
var beautify = require('gulp-beautify');
var gzip = require('gulp-gzip');
var fs = require('fs');
var path = require('path');

var config = require('./../config');

module.exports = function(gulp) {

    /**
     * Tasks
     */

    gulp.task('default', []);
    gulp.task('test', ['test--unitSpecs']);
    gulp.task('build', ['build--update-sourcemapLinking']);
    gulp.task('deploy', ['deploy--version-up']);

    /**
     * Deploy
     */

    function updateVersion(type, fileName, up) {
        var versionUp = (up !== undefined) ? up : true;

        // Bump version of package.json and bower.json only
        var buff = JSON.parse(fs.readFileSync(fileName));
        // Display current version for the user.
        console.log(fileName);
        console.log('Old version: ' + buff.version);
        var versionTypeValues = buff.version.split('-')[0].split('.');

        if (type === 'patch') {
            var versionTypeNum = parseInt(versionTypeValues[2]);
            if (versionUp)
                ++versionTypeNum;
            else
                versionTypeNum = (versionTypeNum > 0) ? --versionTypeNum : 0;
            versionTypeValues[2] = versionTypeNum;
        } else if (type === 'minor') {
            var versionTypeNum = parseInt(versionTypeValues[1]);
            if (versionUp)
                ++versionTypeNum;
            else
                versionTypeNum = (versionTypeNum > 0) ? --versionTypeNum : 0;
            versionTypeValues[1] = versionTypeNum;
            versionTypeValues[2] = 0; // Reset patch version.
        } else if (type === 'major') {
            var versionTypeNum = parseInt(versionTypeValues[0]);
            if (versionUp)
                ++versionTypeNum;
            else
                versionTypeNum = (versionTypeNum > 0) ? --versionTypeNum : 0;
            versionTypeValues[0] = versionTypeNum;
            versionTypeValues[1] = 0; // Reset minor version.
            versionTypeValues[2] = 0; // Reset patch version.
        }

        var versionStr = versionTypeValues.join('.');

        // Write the new version to .json.
        buff.version = versionStr;
        buff = JSON.stringify(buff);
        fs.writeFileSync(fileName, buff);

        // Display new version.
        console.log('New version: ' + versionStr);

        // Reformat the new files back to easily readable.
        gulp.src(config.paths.PACKAGE_CONFIGS)
            .pipe(beautify())
            .pipe(gulp.dest('./'));
    }

    // Run all units tests.
    gulp.task('deploy--version-up', ['build'], function(cb) {
        gulp.src('package.json')
            .pipe(prompt.prompt({
                type: 'checkbox',
                name: 'bump',
                message: 'What type of bump would you like to increase the version by? (None)',
                choices: ['patch', 'minor', 'major'],
            }, function(res) {
                var bumpType = res.bump[0];
                updateVersion(bumpType, 'package.json');
                updateVersion(bumpType, 'bower.json');
            }));

        return cb();
    });

    gulp.task('deploy--version-down', [], function(cb) {
        gulp.src('package.json')
            .pipe(prompt.prompt({
                type: 'checkbox',
                name: 'bump',
                message: 'What type of bump would you like to increase the version by? (None)',
                choices: ['patch', 'minor', 'major'],
            }, function(res) {
                var bumpType = res.bump[0];
                updateVersion(bumpType, 'package.json', false);
                updateVersion(bumpType, 'bower.json', false);
            }));

        return cb();
    });

    /**
     * Test
     */

    // Run all units tests.
    gulp.task('test--unitSpecs', function() {
        return gulp.src(config.paths.SPECS)
            .pipe(jasmine());
    });

    /**
     * Build
     */

    // Clear the distribution directory in case files/folders were removed from last build.
    gulp.task('build--clean-dist', ['test'], function() {
        return gulp.src(config.paths.DIST, {
                read: false
            })
            .pipe(clean())
            .pipe(gulp.dest('./'));
    });

    // Minify JS with source maps and generate source maps.
    gulp.task('build--compress-min', ['build--clean-dist'], function() {
        return gulp.src(config.paths.JS_SRC)
            .pipe(rename(function(path) {
                path.extname = '.min.js'
            }))
            .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(sourcemaps.write('./', {
                sourceRoot: '../src'
            }))
            .pipe(gulp.dest(config.paths.DIST));
    });

    // Minify JS with source maps and generate source maps.
    gulp.task('build--compress-gzip', ['build--compress-min'], function() {
        return gulp.src(config.paths.JS_DIST)
            .pipe(rename(function(path) {
                path.extname = ''
            }))
            .pipe(gzip({
                append: true,
                threshold: true
            }))
            .pipe(gulp.dest(config.paths.DIST));
    });

    // Rename .min.js.map files to .min.map.
    gulp.task('build--rename-sourcemaps', ['build--compress-gzip'], function() {
        return gulp.src(config.paths.SOURCE_MAPS)
            .pipe(rename(function(path) {
                path.basename = path.basename.split('.')[0],
                    path.extname = '.min.map'
            }))
            .pipe(gulp.dest(config.paths.DIST));
    });

    // Clean up .min.js.map files.
    gulp.task('build--clean-renamedSourcemaps', ['build--rename-sourcemaps'], function() {
        return gulp.src(config.paths.DIST + '*.min.js.map', {
                read: false
            })
            .pipe(clean())
            .pipe(gulp.dest(config.paths.DIST));
    });

    // Fixes sourcemap linking. 
    gulp.task('build--update-sourcemapLinking', ['build--clean-renamedSourcemaps'], function(cb) {
        recursiveread(config.paths.DIST, ['node_modules', 'bower_components', '.git'], function(err, files) {
            for (var i = 0; i < files.length; i++) {
                var filePath = files[i];
                // Grab map file to alter.
                if (filePath.indexOf('.min.map') !== -1) {
                    // Read file.
                    var buff = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    // Clear invlaid sources.
                    var sources = buff['sources'] = [];
                    // Get the file name.
                    // Keep relative path for nested files in src/
                    // Rip off dist/
                    var fileName = filePath.split('\\');
                    fileName.shift();
                    fileName = fileName.join('\\');
                    fileName = fileName.split('.');
                    fileName = fileName[0];
                    // Make file type js
                    fileName += '.js';
                    // Add the source file to the map sources.
                    sources.push(fileName);
                    // Back to JSON
                    buff = JSON.stringify(buff);
                    // Write the new .map file.
                    fs.writeFile(filePath, buff);
                }

                // Grab minified js file to change .map link path.
                if (filePath.indexOf('.min.js') !== -1) {
                    // Read file.
                    var buff = fs.readFileSync(filePath, 'utf8').toString();
                    // Get file name
                    var sourceMappingKey = '//# sourceMappingURL=';
                    var filePathIndex = buff.indexOf(sourceMappingKey);
                    if (filePathIndex !== -1) {
                        var currSourceFileName = buff.substring(filePathIndex + sourceMappingKey.length, buff.length);
                        var buff = buff.substring(0, filePathIndex + sourceMappingKey.length);
                        // Take out .js.
                        currSourceFileName = currSourceFileName.split('.');
                        currSourceFileName.splice(2, 1);
                        currSourceFileName = currSourceFileName.join('.');
                        // Update file with new path.
                        buff += currSourceFileName;
                        // Write the new .js file.
                        fs.writeFile(filePath, buff);
                    }
                }
            }
        });

        return cb();
    });
}

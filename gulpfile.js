'use strict';
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const bump = require('gulp-bump');
const eslint = require('gulp-eslint');

gulp.task('lint', () => {
    return gulp.src(['**/*.js','!node_modules/**', '!**/bower_components/**'])
        .pipe(eslint({configFile: '.eslintc.json', fix: true}))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(gulpIf(isFixed, gulp.dest('./')));
});

gulp.task('default', ['lint'], function () {
    // This will only run if the lint task is successful... 
});

gulp.task('version:bump', () => {
    gulp.src('./package.json')
    .pipe(bump())
    .pipe(gulp.dest('./'));
    gulp.src('./app/package.json')
    .pipe(bump())
    .pipe(gulp.dest('./app/'));
});

gulp('version:tag', () => {
    var pjson = require('./package.json');
    git.tag(pjson.version, 'Travis bumped new version', function (err) {
        if (err) throw err;
    });
});

gulp.task('version:publish', gulp.series('version:bump', 'version:tag', function(done) {
  done();
}));

function isFixed(file) {
	// Has ESLint fixed the file contents?
	return file.eslint != null && file.eslint.fixed;
}
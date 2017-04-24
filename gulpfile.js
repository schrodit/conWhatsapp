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

gulp.task('bump', () => {
    gulp.src('./package.json')
    .pipe(bump())
    .pipe(gulp.dest('./'));
    gulp.src('./app/package.json')
    .pipe(bump())
    .pipe(gulp.dest('./app/'));
});


function isFixed(file) {
	// Has ESLint fixed the file contents?
	return file.eslint != null && file.eslint.fixed;
}
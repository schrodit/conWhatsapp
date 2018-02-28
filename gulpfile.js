'use strict';
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const runSequence = require('run-sequence');
const git = require('gulp-git');
const bump = require('gulp-bump');
const eslint = require('gulp-eslint');

const fs = require('fs');
const semver = require('semver');

let version = "";

function setVersion() {
    let pjson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
    version = semver.inc(pjson.version, 'patch');
}

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
    setVersion();
    gulp.src('./package.json')
    .pipe(bump({
        version: version
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('version:commit', () => {
    return gulp.src('./package.json')
      .pipe(git.commit(`Version: ${version}`));
});

gulp.task('version:tag', () => {
    git.tag(version, 'Travis bumped new version', function (err) {
        if (err) throw err;
    });
});

gulp.task('version:publish', function() {
    runSequence('version:bump', 'version:commit', 'version:tag');
});

function isFixed(file) {
	// Has ESLint fixed the file contents?
	return file.eslint != null && file.eslint.fixed;
}
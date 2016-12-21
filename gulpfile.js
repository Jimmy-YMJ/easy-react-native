"use strict";

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const fs = require('fs');
const spawn = require('child_process').spawn;

gulp.task('eslint', function () {
  return gulp.src('./src/**').pipe(eslint());
});

gulp.task('publish', function (cb) {
  const publish = spawn('npm', ['publish'], {cwd: './build/package', stdio: 'inherit'});
  publish.on('close', () => { cb(); });
  publish.on('error', (err) => { cb(err) });
});

gulp.task('default', ['eslint']);

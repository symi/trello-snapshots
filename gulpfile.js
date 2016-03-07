'use strict'
const fs = require('fs'),
    gulp = require('gulp'),
    jsdoc2md = require('gulp-jsdoc-to-markdown'),
    jasmine = require('gulp-jasmine'),
    concat = require('gulp-concat');

gulp.task('doc', () => {
  return gulp.src('src/**/*.js')
    .pipe(concat('README.md'))
    .pipe(jsdoc2md({ 
        template: fs.readFileSync('./jsdoc2md/readme.tpl.hbs', 'utf8'),
        separators: true
    }))
    .on('error', (err) => {
      console.log('jsdoc2md failed:', err.message)
    })
    .pipe(gulp.dest('.'));
});

gulp.task('test', () => {
   return gulp.src('tests/**/*.js')
    .pipe(jasmine()); 
});
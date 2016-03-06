'use strict'
var fs = require('fs')
var gulp = require('gulp')
var jsdoc2md = require('gulp-jsdoc-to-markdown')
var concat = require('gulp-concat')

gulp.task('doc', function () {
  return gulp.src('src/**/*.js')
    .pipe(concat('README.md'))
    .pipe(jsdoc2md({ 
        template: fs.readFileSync('./jsdoc2md/readme.tpl.hbs', 'utf8'),
        separators: true
    }))
    .on('error', function (err) {
      console.log('jsdoc2md failed:', err.message)
    })
    .pipe(gulp.dest('.'));
})
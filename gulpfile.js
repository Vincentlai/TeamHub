/**
 * Gulp config file
 * Created by Qiang Lai on 2016/10/28.
 */

var gulp = require('gulp'),
    less = require('gulp-less'),
    minifycss = require('gulp-minify-css'),
    // jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    del = require('del');


gulp.task('styles', function () {
   return gulp.src('src/less/*.less')
       .pipe(less())
       .pipe(gulp.dest('public/css'))
       .pipe(notify({ message: 'Styles task complete' }));
});

// gulp.task('scripts', function () {
//    return gulp.src('public/js/*.js')
//        .pipe(jshint('.jshintrc'))
//        .pipe(jshint.reporter('default'))
//        .pipe(notify({message: 'scripts task complete'}));
// });

gulp.task('clean', function (cb) {
   del(['public/css/*'], cb)
});

gulp.task('default', function () {
    // gulp.run('clean');
    gulp.run('styles');
    gulp.watch('./src/less/*.less', function(){
        gulp.run('styles');
    });
    gulp.watch(['public/css/*']).on('change', livereload.changed);
});

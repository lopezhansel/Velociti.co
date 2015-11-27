'use strict';
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const browserSync = require('browser-sync');
const nodemon = require('gulp-nodemon');
const uglify = require('gulp-uglify');

const paths = {
  jsSrc: 'public/js/**/*.js',
  jsBuild: 'public/build/js'
};


gulp.task('default',['browser-sync','javascript','watch']);

gulp.task('browser-sync', ['nodemon'], () => {
	browserSync.init(null, {
		proxy: {
            target: "localhost:5000",
            ws: true
        },
        files: ["public/**/*.*"],
        browser: "google chrome",
        port: 7000,
        reloadDelay: 1000
	});
});

gulp.task('nodemon', (cb) => {
	var started = false;
	return nodemon({
		script: 'server.js',
        ignore: ['/public/**',  '/gulpfile.js']
	}).on('start',  () =>{
		// to avoid nodemon being started multiple times
		if (!started) {
			cb();
			started = true; 
		} 
	});
});	

gulp.task('javascript',()=>{
    return gulp.src(paths.jsSrc)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        // .pipe(uglify()) // temporarily disable 
        // .pipe(concat('velociti.js'))
        // .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.jsBuild));
});

gulp.task('watch', () => {
  gulp.watch(paths.jsSrc, ['javascript']);
});


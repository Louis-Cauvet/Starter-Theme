// Loading CommonJs dependencies
const gulp = require('gulp'),
    twig=  require('gulp-twig'),
    sass = require('gulp-sass')(require('sass')),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),

    fs = require('fs'),
    del = require('del');


// Loading paths defined in 'package.json'
const pkg = JSON.parse(fs.readFileSync('./package.json'));


/*******************************
 **  BUILD HTML
 ******************************/
// Cleaning task for HTML into 'marmite-dist'
gulp.task('html:clean', function () {
    return del([
        pkg.path.dist + '/views/../*.html',               // Deletting all HTML files contained in "marmite-dist"
    ]);
});


// Converting task from Twig into 'marmite-src' to HTML into 'marmite-dist'
gulp.task('html:build', function (){
    return gulp.src([
        pkg.path.src + '/views/pages/*.twig',              // Getting the path of twig files which need to be convert in HTML
    ])
    .pipe(plumber())                                       // Starting Gulp error management
    .pipe(twig({}))                                 // Conversion to HTML
    .on('error', function (err) {                    // Sending error messages when catching it
        notify({
            title: 'Error during Gulp Build HTML',
            message: 'Check the Task Runner or console for more details.'
        }).write(err);
        console.error(err);
        this.emit('end');
    })
    .pipe(plumber.stop())                                  // Stopping Gulp error management
    .pipe(rename({extname: '.html'}))                  // Modifying files' extension
    .pipe(gulp.dest(pkg.path.dist+'/pages/'));                   // Transferring processed files to destination folder
});


/*******************************
 * DEFAULT TASKS
 ******************************/
// "gulp html"
gulp.task('html', gulp.series('html:clean', 'html:build'));
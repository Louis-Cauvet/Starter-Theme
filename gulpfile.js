// Loading CommonJs dependencies
const gulp = require('gulp'),
    fs = require('fs'),
    del = require('del');
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    livereload = require('gulp-livereload'),
    plumber = require('gulp-plumber'),

    // HTML EXTENSIONS
    twig = require('gulp-twig'),

    // CSS EXTENSIONS
    sass = require('gulp-sass')(require('sass')),
    cleancss = require('gulp-clean-css');


// Loading ES dependencies (which not support 'require')
async function loadAutoprefixer() {
    const autoprefixer = await import('gulp-autoprefixer');
    return autoprefixer.default;
}


// Loading paths defined in 'package.json'
const pkg = JSON.parse(fs.readFileSync('./package.json'));


/*******************************
 **  BUILD HTML
 ******************************/
// Cleaning task for HTML into 'marmite-dist'
gulp.task('html:clean', function () {
    return del(pkg.path.dist + '/pages/*.html' );            // Deletting all HTML files contained in "marmite-dist"
});


// Converting task from Twig into 'marmite-src' to HTML into 'marmite-dist'
gulp.task('html:build', function (){
    return gulp.src(pkg.path.src + '/views/pages/*.twig')              // Getting the path of twig files which need to be convert in HTML
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
    .pipe(gulp.dest(pkg.path.dist+'/pages/'));             // Transferring processed files to destination folder
});


/*******************************
 **  BUILD CSS
 ******************************/
// Cleaning task for CSS into 'marmite-dist'
gulp.task('css:clean', function () {
    return del(pkg.path.dist + '/assets/css/*.css' );            // Deletting all HTML files contained in "marmite-dist"
});


// Converting task from 'styles.scss' into 'marmite-src' to 'styles.css' into 'marmite-dist'
gulp.task('css:build', async function () {
    const autoprefixer = await loadAutoprefixer();

    const cssFiles = [
        { src: pkg.path.src + '/assets/scss/styles.scss', outputName: 'styles.css' },     // Getting the path of 'styles.scss' for convert him in CSS
        { src: pkg.path.src + '/assets/scss/print.scss', outputName: 'print.css' }        // Getting the path of 'print.scss' for convert him in CSS
    ];

    return cssFiles.map(file => {                          // Visiting each CSS file
        return gulp.src(file.src)
        .pipe(sass({ outputStyle: 'expanded' }))                              // Compilating SCSS in CSS
        .on('error', function (err) {                                          // Sending error messages when catching it
            notify({
                title: 'Error during Gulp Build CSS',
                message: 'Check the Task Runner or console for more details.'
            }).write(err);
            console.error(err);
            this.emit('end');
        })
        .pipe(autoprefixer())                                        // Adding automatically specific prefixers for all navigators's compatibility (depending of "browserlist" in package.json)
        .pipe(rename(file.outputName))                               // Choosing the new CSS file's name
        .pipe(gulp.dest(pkg.path.dist + '/assets/css/'))             // Transferring simple CSS file to destination folder
        .pipe(cleancss())                                            // Minifying CSS files
        .pipe(rename({ extname: '.min.css' }))                   // Modifying files' extension to indicate than it's minified
        .pipe(gulp.dest(pkg.path.dist + '/assets/css/'))             // Transferring minified CSS file to destination folder
        .pipe(livereload());                                         // Redisplaying automatically the browser each time a CSS file is saved
    });
});


/*******************************
 * DEFAULT TASKS
 ******************************/
gulp.task('html', gulp.series('html:clean', 'html:build'));                // "gulp html"
gulp.task('css', gulp.series('css:clean', 'css:build'));                   // "gulp css"
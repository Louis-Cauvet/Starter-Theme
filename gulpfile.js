// Loading CommonJs dependencies
const gulp = require('gulp'),
    fs = require('fs'),
    del = require('del');
    notify = require('gulp-notify'),
    rename = require('gulp-rename'),
    livereload = require('gulp-livereload'),
    plumber = require('gulp-plumber'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    connect = require('gulp-connect-multi')(),

    // HTML EXTENSIONS
    twig = require('gulp-twig'),

    // CSS EXTENSIONS
    sass = require('gulp-sass')(require('sass')),
    cleancss = require('gulp-clean-css'),

    // JS EXTENSIONS
    uglify = require('gulp-uglify'),
    eslint = require('gulp-eslint'),

    // IMAGES EXTENSIONS,
    imagemin = require('gulp-imagemin'),
    svgSprite = require('gulp-svg-sprite'),

    // ES6 LINKED EXTENSIONS
    babelify = require('babelify'),
    browserify = require('browserify');


// Loading ES dependencies (which not support 'require')
async function loadAutoprefixer() {
    const autoprefixer = await import('gulp-autoprefixer');
    return autoprefixer.default;
}

async function loadStripDebug() {
    const stripDebug = await import('gulp-strip-debug');
    return stripDebug.default;
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


// Converting task from 'styles.scss' into 'marmite-src' to 'styles.min.css' into 'marmite-dist'
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
        .pipe(cleancss())                                            // Minifying CSS files
        .pipe(rename({ extname: '.min.css' }))                   // Modifying files' extension to indicate than it's minified
        .pipe(gulp.dest(pkg.path.dist + '/assets/css/'))             // Transferring minified CSS file to destination folder
        // .pipe(livereload());                                         // Redisplaying automatically the browser each time a CSS file is saved
    });
});


/*******************************
 **  BUILD JAVASCRIPT
 ******************************/
// Cleaning task for JS into 'marmite-dist'
gulp.task('js:clean', function () {
    return del(pkg.path.dist + '/assets/js/*.js' );            // Deletting all JS files contained in "marmite-dist"
});

// Checking task to verify if the JS code is correctly written
gulp.task('js:check', function () {
    return gulp.src([
        pkg.path.src + '/assets/js/script-front.js'                       // Getting JS files
    ])
    .pipe(eslint())                                                       // Analysing the JS syntax
    .pipe(eslint.format())                                                // Displaying syntax error messages in console
    .pipe(notify(function (file) {
        if (!file.eslint) {
            return false;
        }
        const errors = file.eslint.messages.map(function (data) {
            if (data.error) {
                return '(' + data.line + ':' + data.column + ') ' + data.message;            // Writting syntax error messages finded by eslint
            }
        }).join('\n');
        if (file.eslint.errorCount > 0 || file.eslint.warningCount > 0) {
            return file.relative + ' (' + file.eslint.errorCount + ' errors, ' + file.eslint.warningCount + ' warnings)\n' + errors;
        }
        return false;
    }))
});

// Converting task from 'script-front.js' into 'marmite-src' to 'script-front.min.js' into 'marmite-dist'
gulp.task('js:build', async function () {
    const stripDebug = await loadStripDebug();

    return browserify({
        entries: [pkg.path.src + '/assets/js/script-front.js'],      // Defining the JS file used as an entry point
        standalone: 'global',                                        // All the JS code is accessible from the 'global' object
        debug: true
    })
    .transform('babelify', {                                 // Transpiling modern Js code to make it compatible with older browsers
        presets: ['@babel/preset-env'],                              // Using the babelify's flexible mode (based on 'targets' defined in 'babel.config.json')
    })
    // .transform('browserify-shim', {global: true, settingsGlobal: true})      // Making CommonJs modules compatible with Browserify
    .bundle()                                                        // Grouping all JS modules and their dependencies in only one JS file
    .on('error', function (err) {                                               // Sending error messages when catching it
        notify({
            title: 'Error during Gulp Build JS',
            message: 'Check the Task Runner or console for more details.'
        }).write(err);
        console.error(err);
        this.emit('end');
    })
    .pipe(source('script-front.js'))                      // Changing the data flow from Browserify to Gulp
    .pipe(buffer())                                               // Converting the stream into a buffer to enable the use of Gulp plugins that expect a complete file (such as gulp-uglify).
    // .pipe(stripDebug())                                        // Deleting debug declarations in code (console, alert, debugger)   --> ACTIVATE FOR DEPLOY IN PROD
    .pipe(uglify())                                               // Minifying JS file
    .pipe(rename({extname: '.min.js'}))                       // Modifying files' extension to indicate than it's minified
    .pipe(gulp.dest(pkg.path.dist + '/assets/js/'))               // Transferring minified JS file to destination folder
    // .pipe(livereload());                                          // Triggering livereload for reload automatically the browser
});


/*******************************
 ** MINIFY IMAGES
 ******************************/
// Cleaning task for images into 'marmite-dist'
gulp.task('images:clean', function () {
    return del(pkg.path.dist + '/assets/img/**/*' );            // Deletting all images contained in "marmite-dist"
});

// Optimizing task from images into 'marmite-src' to minified images into 'marmite-dist'
gulp.task('images:optimize',  function () {
    return gulp.src(pkg.path.src + '/assets/img/**/*.{svg,gif,jpg,png}', { encoding : false })               // Getting all images SVG, JPEG, PNG or GIF
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),             // Optimizing GIF images
        imagemin.mozjpeg({progressive: true}),             // Optimizing JPEG images
        imagemin.optipng({optimizationLevel: 5}),          // Optimizing PNG images
        imagemin.svgo({                                    // Optimizing SVG images
            plugins: [{ removeViewBox: false }]
        })
    ]))
    .on('error', function (err) {                              // Sending error messages when catching it
        notify({
            title: 'Gulp Build TWIG',
            message: 'Check the Task Runner or console for more details.'
        }).write(err);
        console.error(err);
        this.emit('end');
    })
    .pipe(gulp.dest(pkg.path.dist + '/assets/img/'));                // Transferring minified images to destination folder
});

gulp.task('images:simple-copy', function() {
    return gulp.src('marmite-src/assets/img/**', { encoding : false })
    .pipe(gulp.dest('marmite-dist/assets/img'));
});


const svgSpriteconfig = {                     // Defining the svg properties for the sprite
    shape : {
        dimension : {                              // Setting maximum dimensions (in pixels)
            maxWidth : 32,
            maxHeight : 32
        },
    },
    mode : {
        symbol : {                                 // Activating the "symbol" mode
            render : {
                css : false,                       // Deactivating of CSS file generation for icon size
                scss : false                       // Deactivating of SCSS file generation for icon size
            },
            dest : '.',                            // Defining the sprite path in destination folder
            sprite : 'icon-sprite.svg',            // Defining the sprite name
            example : true                         // Building an example page
        }
    },
    svg : {
        doctypeDeclaration : false,               // Deactivating a doctype declaration in the sprite
        dimensionAttributes : false               // Deactivating dimension attributes in the sprite
    }
};
// Building task for svg sprite
gulp.task('images:build-svg-sprite', function() {
    return gulp.src(pkg.path.src + '/assets/img/svg/*')         // Getting all svg images
    .pipe(plumber())                                            // Getting errors if they are meet
    .pipe(svgSprite(svgSpriteconfig))                           // Building the svg sprite with parameters define up
    .pipe(gulp.dest(pkg.path.dist + '/assets/img/svg/'))
    // .pipe(livereload());                                        // Triggering livereload for reload automatically the browser
});


/*******************************
 ** FONTS
 ******************************/
// Cleaning task for fonts into 'marmite-dist'
gulp.task('fonts:clean', function () {
    return del(pkg.path.dist + '/assets/fonts/**/*' );            // Deletting all fonts contained in "marmite-dist"
});

// Converting task from fonts into 'marmite-src' to fonts into 'marmite-dist'
gulp.task('fonts:build', function () {
    return gulp.src(pkg.path.src + '/assets/fonts/**/*')                   // Getting all fonts
    .pipe(gulp.dest(pkg.path.dist + '/assets/fonts'));                     // Transferring fonts to destination folder
});


/*******************************
 * PRACTICAL TASKS
 ******************************/
// Task which opened a new local web server based on files contained in 'marmite-dist'
gulp.task('start-server', connect.server({
    root: [pkg.path.dist + '/pages/', pkg.path.dist],              // Getting the folder on which the local server is based
    port: 8000,                                                    // Choosing a port for the local web server
    livereload: false,
    open: {
        browser: 'chrome'                                          // Opening chrome by default (can also be firefox, edge...)
    },
    fallback: pkg.path.dist + '/pages/'                            // Choosing the entry point for user in the local server
}));

// Task which monitored files, to automatically execute the corresponding tasks
gulp.task('watch', function () {
    gulp.watch(pkg.path.src + '/assets/js/**/*.js', gulp.series('js'));              // Monitoring on JS files
    gulp.watch(pkg.path.src + '/assets/scss/**/*.scss', gulp.series('css'));         // Monitoring on SCSS files
    gulp.watch(pkg.path.src + '/views/**/*.twig', gulp.series('html'));              // Monitoring on Twig files
    gulp.watch(pkg.path.src + '/assets/img/**/*', gulp.series('images'));            // Monitoring on images
    gulp.watch(pkg.path.src + '/assets/fonts/**/*', gulp.series('fonts'));           // Monitoring on fonts
});


/*******************************
 * DEFAULT TASKS
 ******************************/
gulp.task('html', gulp.series('html:clean', 'html:build'));                  // "gulp html"
gulp.task('css', gulp.series('css:clean', 'css:build'));                     // "gulp css"
gulp.task('js', gulp.series('js:clean', 'js:check', 'js:build'));            // "gulp css"
gulp.task('images', gulp.series('images:clean','images:optimize', 'images:build-svg-sprite'));      // "gulp images"
gulp.task('fonts', gulp.series('fonts:clean','fonts:build'));                // "gulp fonts"
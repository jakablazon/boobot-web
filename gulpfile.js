// Globals
var browserSync = require('browser-sync'),
    gulp = require('gulp'),
    autoPrefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    fileInclude = require('gulp-file-include'),
    imageMin = require('gulp-imagemin'),
    cssNano = require('gulp-cssnano'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    clean = require('gulp-clean'),
    watch = require('gulp-watch'),
    runSequence = require('run-sequence'),
    configFile = require('./config_prod.json'),
    importsFile = require('./imports.json');
    connect = require('gulp-connect');

// Paths
var paths = configFile.paths;

// Config
var config = configFile.config;

// Clean
gulp.task('clean', function() {
    return gulp.src(paths.dist)
        .pipe(clean({force: true}))
});

// Styles
gulp.task('styles', function() {
    return gulp.src(paths.src + 'styles/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoPrefixer({
            browsers: [
                'last 2 version',
                'android 2.3',
                'android 4',
                'opera 12'
            ]
        }))
        .pipe(cssNano())
        .pipe(concat('main.css'))
        .pipe(sourcemaps.write('sourcemaps'))
        .pipe(gulp.dest(paths.dist + 'styles'))
        .pipe(browserSync.stream());
});

// Scripts
gulp.task('scripts', function() {
    return gulp.src(importsFile.scripts)
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write('sourcemaps'))
        .pipe(gulp.dest(paths.dist + 'scripts'))
        .pipe(browserSync.stream());
});

// Html
gulp.task('html', function() {
    return gulp.src(paths.src + 'templates/*.html')
        .pipe(fileInclude())
        .pipe(gulp.dest(paths.dist))
        .pipe(browserSync.stream());
});

// Images
gulp.task('images', function() {
    return gulp.src(paths.src + 'images/*')
        .pipe(imageMin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{removeUnknownsAndDefaults: false}, {cleanupIDs: false}]
        }))
        .pipe(gulp.dest(paths.dist + 'images'))
        .pipe(browserSync.stream());
});

// Fonts
gulp.task('fonts', function() {
    return gulp.src(paths.src + 'fonts/**/*')
        .pipe(gulp.dest(paths.dist + 'fonts'))
        .pipe(browserSync.stream());
});

// Default Gulp Build
gulp.task('default', function(callback) {
    runSequence(
        'html',
        'styles',
        'scripts',
        'fonts',
        'images',
        callback);
});

// Gulp Build - Same as Default, but with a clean up beforehand
gulp.task('build',['clean'], function() {
    gulp.start('default');
});

/* Gulp watch - watch changes of files in 'src' folder (run it by 'gulp watch') */
gulp.task('watch', function() {
    browserSync.init({
        proxy: config.proxy,
        port: config.port,
        ui: {
            port: config.portUi
        },
        files: config.files
    });

    gulp.watch('templates/**/*', {cwd: paths.src}, ['html']);
    gulp.watch('scripts/**/*', {cwd: paths.src}, ['scripts']);
    gulp.watch('images/**/*', {cwd: paths.src}, ['images']);
    gulp.watch('styles/**/*.scss', {cwd: paths.src}, ['styles']);
});

console.log('PORT', process.env.PORT);
gulp.task('serve-prod', function() {
  connect.server({
    root: ['dist'],
    port: process.env.PORT || 5000, // localhost:5000
    livereload: false
  });
});

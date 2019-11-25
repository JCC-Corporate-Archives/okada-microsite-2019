"use strict";

// Defining requirements
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var cssnano = require('gulp-cssnano');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var ignore = require('gulp-ignore');
var rimraf = require('gulp-rimraf');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var del = require('del');
var cleanCSS = require('gulp-clean-css');
var replace = require('gulp-replace');
var autoprefixer = require('gulp-autoprefixer');

// Linters
var eslint = require('gulp-eslint');
var sassLint = require('gulp-sass-lint');

// Configuration file to keep your code DRY
var cfg = require('./gulpconfig.json');
var paths = cfg.paths;

// Run:
// gulp sass
// Compiles SCSS files (if you don't have compass)
gulp.task('sass', function () {
  var stream = gulp.src(`${paths.sass}/*.scss`)
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(sass({ errLogToConsole: true }))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.css))
    .pipe(rename('style.css'));
  return stream;
});

// Run:
// gulp watch
// Starts watcher. Watcher runs gulp sass task on changes
gulp.task('watch', function () {
  gulp.watch(`${paths.sass}/**/*.scss`, gulp.series('styles'));
  gulp.watch([`${paths.src}/js/**/*.js`, 'js/**/*.js', '!js/custom.js', '!js/custom.min.js'], gulp.series('scripts'));

  //Inside the watch task.
  gulp.watch(`${paths.imgsrc} /**`, gulp.series('imagemin-watch'));
});

// Run:
// gulp imagemin
// Running image optimizing task
gulp.task('imagemin', function () {
  gulp.src(`${paths.imgsrc}/**`)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.img));
});

/**
 * Ensures the 'imagemin' task is complete before reloading browsers
 * @verbose
 */
gulp.task('imagemin-watch', gulp.series('imagemin', function reloadBrowserSync() {
  browserSync.reload();
}));

// Run:
// gulp cssnano
// Minifies CSS files
gulp.task('cssnano', function () {
  return gulp.src(`${paths.css}/style.css`)
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cssnano({ discardComments: { removeAll: true } }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.css));
});

gulp.task('minifycss', function () {
  return gulp.src(paths.css + '/style.css')
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(cleanCSS({ compatibility: '*' }))
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.css));
});

gulp.task('cleancss', function () {
  return gulp.src(`${paths.css}/*.min.css`, { read: false }) // Much faster
    .pipe(ignore('style.css'))
    .pipe(rimraf());
});

gulp.task('styles', gulp.series('sass', 'minifycss'));

// Run:
// gulp browser-sync
// Starts browser-sync task for starting the server.
gulp.task('browser-sync', function () {
  const platform = process.platform;

  if (platform === "linux" && platform !== "win32") {
    browserSync.init(cfg.browserSyncWatchFiles, cfg.browserSyncOptions);
  } else if (platform === "darwin") {
    browserSync.init(cfg.browserSyncWatchFiles, cfg.browserSyncOptionsDarwin)
  }
});

// Run
// gulp eslint
// JS Linter
gulp.task('eslint', function () {
  return gulp.src([
    `${paths.src}/js/*`,
    `!${paths.src}/js/skip-link-focus-fix.js`,
    `!${paths.src}/js/wow.js`
  ])
    .pipe(eslint({ configFile: '.eslintrc' }))
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

// Run
// gulp sass-lint
// SASS Linter
gulp.task('sass-lint', function () {
  return gulp.src([
    `${paths.sass}/**/*`,
    `!${paths.sass}/vendors/**/*`
  ])
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
});

// Run:
// gulp scripts.
// Uglifies and concat all JS files into one
gulp.task('scripts', function () {
  var scripts = [
    // Start - All BS4 stuff
    `${paths.src}/js/vendors/bootstrap4/bootstrap.bundle.js`,
    // End - All BS4 stuff

    // Start - Underscores
    `${paths.src}/js/skip-link-focus-fix.js`,
    // End - Underscores

    // Start - Moment
    `${paths.src}/js/vendors/moment/moment.js`,
    // Countdown API
    `${paths.src}/js/vendors/moment-countdown/dist/moment-countdown.js`,
    // End - Moment

    // Adding currently empty javascript file to add on for your own themes´ customizations
    // Please add any customizations to this .js file only!
    `${paths.src}/js/custom.js`,
  ];
  gulp.src(scripts, { allowEmpty: true })
    .pipe(concat('custom.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.js));

  return gulp.src(scripts, { allowEmpty: true })
    .pipe(concat('custom.js'))
    .pipe(gulp.dest(paths.js));
});

// Run:
// gulp watch-bs
// Starts watcher with browser-sync. Browser-sync reloads page automatically on your browser
gulp.task('watch-bs', gulp.parallel('browser-sync', 'watch', 'scripts'));

// Deleting any file inside the /src folder
gulp.task('clean-source', function () {
  return del(['src/**/*']);
});

// Run:
// gulp copy-assets.
// Copy all needed dependency assets files from bower_component assets to themes /js, /scss and /fonts folder. Run this task after bower install or bower update

////////////////// All Bootstrap SASS  Assets /////////////////////////
gulp.task('copy-assets', function () {

  ////////////////// All Bootstrap 4 Assets /////////////////////////
  // Copy all JS files
  var stream = gulp.src(`${paths.node}bootstrap/dist/js/**/*.js`)
    .pipe(gulp.dest(`${paths.src}/js/vendors`));

  // Copy all Bootstrap SCSS files
  gulp.src(`${paths.node}bootstrap/scss/**/*.scss`)
    .pipe(gulp.dest(`${paths.src}/sass/vendors/bootstrap4`));

  ////////////////// End Bootstrap 4 Assets /////////////////////////

  // Copy all Font Awesome Fonts
  gulp.src(`${paths.node}font-awesome/fonts/**/*.{ttf,woff,woff2,eot,svg}`)
    .pipe(gulp.dest('./fonts'));

  // Copy all Font Awesome SCSS files
  gulp.src(`${paths.node}font-awesome/scss/*.scss`)
    .pipe(gulp.dest(`${paths.sass}/vendors/fontawesome`));

  // _s SCSS files
  gulp.src(`${paths.node}undescores-for-npm/sass/media/*.scss`)
    .pipe(gulp.dest(`${paths.sass}/vendors/underscores`));

  // _s JS files into /src/js
  gulp.src(`${paths.node}undescores-for-npm/js/skip-link-focus-fix.js`)
    .pipe(gulp.dest(`${paths.src}/js/vendors`));

  // Animate CSS files
  gulp.src(`${paths.node}animate.css/animate.min.css`)
    .pipe(gulp.dest(`${paths.css}`));
  gulp.src(`${paths.node}animate.css/animate.css`)
    .pipe(gulp.dest(`${paths.css}`));

  // WOW.js
  gulp.src(`${paths.node}wowjs/dist/wow.min.js`)
    .pipe(gulp.dest(`${paths.js}`));
  gulp.src(`${paths.node}wowjs/dist/wow.js`)
    .pipe(gulp.dest(`${paths.js}`));

  // Moment.js
  gulp.src(`${paths.node}moment/**/*.js`)
    .pipe(gulp.dest(`${paths.src}/js/vendors/moment`));

  // Moment with Countdown API
  gulp.src(`${paths.node}moment-countdown/**/*.js`)
    .pipe(gulp.dest(`${paths.src}/js/vendors/moment-countdown`));

  return stream;
});

// Deleting the files distributed by the copy-assets task
// TODO: Untested
gulp.task('clean-vendor-assets', function () {
  return del([`${paths.src}/js/vendors/bootstrap4/**`, `${paths.src}/sass/vendors/bootstrap4/**`, './fonts/*wesome*.{ttf,woff,woff2,eot,svg}', `${paths.src}/sass/vendors/fontawesome/**`, `${paths.src}/sass/vendors/underscores/**`, `${paths.src}/js/skip-link-focus-fix.js`, `${paths.js}/**/skip-link-focus-fix.js`, `${paths.js}/**/popper.min.js`, `${paths.js}/**/popper.js`, (paths.vendor !== '' ? (`${paths.js}${paths.vendor}/**`) : '')]);
});

// Deleting any file inside the /dist folder
gulp.task('clean-dist', function () {
  return del([`!${paths.dist}/.git/**`, `!${paths.dist}/.gitinclude`, `${paths.dist}/**`]);
});

// Run
// gulp dist
// Copies the files to the /dist folder for distribution as simple theme
gulp.task('dist', gulp.series(function copyToDistFolder() {
  const ignorePaths = [
    `!${paths.bower}`, `!${paths.bower}/**`,
    `!${paths.node}`, `!${paths.node}/**`,
    `!${paths.src}`, `!${paths.src}/**`,
    `!${paths.dist}`, `!${paths.dist}/**`,
    `!${paths.distprod}`, `!${paths.distprod}/**`,
    `!${paths.sass}`,
    `!${paths.sass}/**`
  ];
  const ignoreFiles = [
    '!readme.txt', '!readme.md', '!package.json', '!package-lock.json', '!gulpfile.js', '!gulpconfig.json',
    '!CHANGELOG.md', '!.travis.yml', '!jshintignore', '!codesniffer.ruleset.xml',
    '!bitbucket-pipelines.yml', '!yarn.lock'
  ];
  return gulp.src(['**/*', ...ignorePaths, ...ignoreFiles, '*'], { 'buffer': false })
    .pipe(replace('/js/jquery.slim.min.js', `/js${paths.vendor}/jquery.slim.min.js`, { 'skipBinary': true }))
    .pipe(replace('/js/popper.min.js', `/js${paths.vendor}/popper.min.js`, { 'skipBinary': true }))
    .pipe(replace('/js/skip-link-focus-fix.js', `/js${paths.vendor}/skip-link-focus-fix.js`, { 'skipBinary': true }))
    .pipe(gulp.dest(paths.dist));
}));

// Execute all linters
gulp.task('lint', gulp.parallel('eslint', 'sass-lint'));

// Deleting any file inside the /dist-product folder
gulp.task('compile', gulp.series('lint', 'styles', 'scripts', 'dist'));

// Setup styles & scripts to test it
gulp.task('setup', gulp.series('lint', 'styles', 'scripts'));

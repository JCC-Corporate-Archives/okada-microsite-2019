"use strict";

// Defining requirements
var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sass = require("gulp-sass");
var cssnano = require("gulp-cssnano");
var rename = require("gulp-rename");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var imagemin = require("gulp-imagemin");
var ignore = require("gulp-ignore");
var rimraf = require("gulp-rimraf");
var sourcemaps = require("gulp-sourcemaps");
var browserSync = require("browser-sync").create();
var del = require("del");
var cleanCSS = require("gulp-clean-css");
var replace = require("gulp-replace");
var autoprefixer = require("gulp-autoprefixer");

// Linters
var eslint = require("gulp-eslint");
var sassLint = require("gulp-sass-lint");

// Configuration file to keep your code DRY
var cfg = require("./gulpconfig.json");
var paths = cfg.paths;

// gulp-shell
var shell = require("gulp-shell");

// set files to be ignore here!
const ignorePaths = [
  `!${paths.bower}/`,
  `!${paths.bower}/**`,
  `!${paths.node}/`,
  `!${paths.node}/**`,
  `!${paths.src}/`,
  `!${paths.src}/**`,
  `!${paths.dist}/`,
  `!${paths.dist}/**`,
  `!${paths.distprod}/`,
  `!${paths.distprod}/**`,
  `!${paths.sass}/`,
  `!${paths.sass}/**`,
  "!build/",
  "!build/**"
];
const deletePaths = [
  `${paths.dist}/bower_components/`,
  `${paths.dist}/node_modules/`,
  `${paths.dist}/src/`,
  `${paths.dist}/dist/`,
  "build/"
];
const ignoreFiles = [
  "!readme.txt",
  "!readme.md",
  "!package.json",
  "!package-lock.json",
  "!gulpfile.js",
  "!gulpconfig.json",
  "!CHANGELOG.md",
  "!.travis.yml",
  "!jshintignore",
  "!codesniffer.ruleset.xml",
  "!bitbucket-pipelines.yml",
  "!yarn.lock"
];
const deleteFiles = [
  `${paths.dist}/bitbucket-pipelines.yml`,
  `${paths.dist}/yarn.lock`,
  `${paths.dist}/gulpconfig.json.sample`,
  `${paths.dist}/gulpfile.js`,
  `${paths.dist}/unix_build.sh`,
  `${paths.dist}/config.rb`,
  "build/"
];

// Run:
// gulp sass
gulp.task("sass", function() {
  var stream = gulp
    .src([`${paths.sass}/style.scss`])
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(
      plumber({
        errorHandler: function(err) {
          console.log(err);
          this.emit("end");
        }
      })
    )
    .pipe(sass({ errLogToConsole: true }))
    .pipe(autoprefixer("last 2 versions"))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(paths.css))
    .pipe(rename("style.css"));
  return stream;
});
gulp.task("sass-svg", function() {
  var stream = gulp
    .src([`${paths.sass}/svg.scss`])
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(
      plumber({
        errorHandler: function(err) {
          console.log(err);
          this.emit("end");
        }
      })
    )
    .pipe(sass({ errLogToConsole: true }))
    .pipe(autoprefixer("last 2 versions"))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(paths.css))
    .pipe(rename("svg.css"));
  return stream;
});

// Run:
// gulp watch
// Starts watcher. Watcher runs gulp sass task on changes
gulp.task("watch", function() {
  gulp.watch(`${paths.sass}/**/*.scss`, gulp.series("styles"));
  gulp.watch(
    [`${paths.src}/js/**/*.js`, "js/**/*.js", "!js/custom.js", "!js/custom.min.js"],
    gulp.series("scripts")
  );

  //Inside the watch task.
  gulp.watch(`${paths.imgsrc} /**`, gulp.series("imagemin-watch"));
});

// Run:
// gulp imagemin
// Running image optimizing task
gulp.task("imagemin", function() {
  gulp
    .src(`${paths.imgsrc}/**`)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.img));
});

/**
 * Ensures the 'imagemin' task is complete before reloading browsers
 * @verbose
 */
gulp.task(
  "imagemin-watch",
  gulp.series("imagemin", function reloadBrowserSync() {
    browserSync.reload();
  })
);

// Run:
// gulp cssnano
// Minifies CSS files
gulp.task("minifycss", function() {
  return gulp
    .src([`${paths.css}/style.css`, `${paths.css}/svg.css`])
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(cleanCSS({ compatibility: "*" }))
    .pipe(
      plumber({
        errorHandler: function(err) {
          console.log(err);
          this.emit("end");
        }
      })
    )
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(paths.css));
});
gulp.task("styles", gulp.series("sass", "sass-svg", "minifycss"));

// Run:
// gulp browser-sync
// Starts browser-sync task for starting the server.
gulp.task("browser-sync", function() {
  const platform = process.platform;

  if (platform === "linux" && platform !== "win32") {
    browserSync.init(cfg.browserSyncWatchFiles, cfg.browserSyncOptions);
  } else if (platform === "darwin") {
    browserSync.init(cfg.browserSyncWatchFiles, cfg.browserSyncOptionsDarwin);
  }
});

// Run
// gulp eslint
// JS Linter
gulp.task("eslint", function() {
  return gulp
    .src([
      `${paths.src}/js/*`,
      `!${paths.src}/js/skip-link-focus-fix.js`,
      `!${paths.src}/js/wow.js`
    ])
    .pipe(eslint({ configFile: ".eslintrc" }))
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

// Run
// gulp sass-lint
// SASS Linter
gulp.task("sass-lint", function() {
  return gulp
    .src([`${paths.sass}/**/*`, `!${paths.sass}/vendors/**/*`])
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
});

// Run:
// gulp scripts.
// Uglifies and concat all JS files into one
gulp.task("scripts", function() {
  var scripts = [
    // Start - All BS4 stuff
    `${paths.src}/js/vendors/bootstrap4/bootstrap.bundle.js`,
    // End - All BS4 stuff

    // Start - Underscores
    `${paths.src}/js/skip-link-focus-fix.js`,
    // End - Underscores

    // Start - Moment
    `${paths.src}/js/vendors/moment/moment.js`,
    // End - Moment

    // Start - Countdown
    `${paths.src}/js/vendors/countdown/countdown.js`,
    // End - Countdown

    // Start - Swiper
    `${paths.src}/js/vendors/swiper/js/swiper.js`,
    // End - Swiper

    // Adding currently empty javascript file to add on for your own themes?? customizations
    // Please add any customizations to this .js file only!
    `${paths.src}/js/custom.js`
  ];
  gulp
    .src(scripts, { allowEmpty: true })
    .pipe(concat("custom.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest(paths.js));

  return gulp
    .src(scripts, { allowEmpty: true })
    .pipe(concat("custom.js"))
    .pipe(gulp.dest(paths.js));
});

// Run:
// gulp watch-bs
// Starts watcher with browser-sync. Browser-sync reloads page automatically on your browser
gulp.task("watch-bs", gulp.parallel("browser-sync", "watch", "scripts"));

// Deleting any file inside the /src folder
gulp.task("clean-source", function() {
  return del(["src/**/*"]);
});

// Run:
// gulp copy-assets.
// Copy all needed dependency assets files from bower_component assets to themes /js, /scss and /fonts folder. Run this task after bower install or bower update

////////////////// All Bootstrap SASS  Assets /////////////////////////
gulp.task("copy-assets", function() {
  ////////////////// All Bootstrap 4 Assets /////////////////////////
  // Copy all JS files
  var stream = gulp
    .src(`${paths.node}bootstrap/dist/js/**/*.js`)
    .pipe(gulp.dest(`${paths.src}/js/vendors`));

  // Copy all Bootstrap SCSS files
  gulp
    .src(`${paths.node}bootstrap/scss/**/*.scss`)
    .pipe(gulp.dest(`${paths.src}/sass/vendors/bootstrap4`));

  ////////////////// End Bootstrap 4 Assets /////////////////////////

  // Copy all Font Awesome Fonts
  gulp
    .src(`${paths.node}font-awesome/fonts/**/*.{ttf,woff,woff2,eot,svg}`)
    .pipe(gulp.dest("./fonts"));

  // Copy all Font Awesome SCSS files
  gulp
    .src(`${paths.node}font-awesome/scss/*.scss`)
    .pipe(gulp.dest(`${paths.sass}/vendors/fontawesome`));

  // Copy sass-mediaqueries
  gulp
    .src(`${paths.node}sass-mediaqueries/*.scss`)
    .pipe(gulp.dest(`${paths.sass}/vendors/sass-mediaqueries`));

  // _s SCSS files
  gulp
    .src(`${paths.node}undescores-for-npm/sass/media/*.scss`)
    .pipe(gulp.dest(`${paths.sass}/vendors/underscores`));

  // _s JS files into /src/js
  gulp
    .src(`${paths.node}undescores-for-npm/js/skip-link-focus-fix.js`)
    .pipe(gulp.dest(`${paths.src}/js/vendors`));

  // Animate CSS files
  gulp.src(`${paths.node}animate.css/animate.min.css`).pipe(gulp.dest(`${paths.css}`));
  gulp.src(`${paths.node}animate.css/animate.css`).pipe(gulp.dest(`${paths.css}`));

  // WOW.js
  gulp.src(`${paths.node}wowjs/dist/wow.min.js`).pipe(gulp.dest(`${paths.js}`));
  gulp.src(`${paths.node}wowjs/dist/wow.js`).pipe(gulp.dest(`${paths.js}`));

  // Moment.js
  gulp.src(`${paths.node}moment/**/*.js`).pipe(gulp.dest(`${paths.src}/js/vendors/moment`));

  // Countdown.js
  gulp.src(`${paths.node}countdown/**/*.js`).pipe(gulp.dest(`${paths.src}/js/vendors/countdown`));

  // Swiper
  gulp.src(`${paths.node}swiper/**/*.js`).pipe(gulp.dest(`${paths.src}/js/vendors/swiper`));
  gulp.src(`${paths.node}swiper/**/*.scss`).pipe(gulp.dest(`${paths.src}/sass/vendors/swiper`));
  gulp.src(`${paths.node}swiper/css/*.css`).pipe(gulp.dest(paths.css));

  // Hover.css
  gulp
    .src(`${paths.node}hover.css/**/*.scss`)
    .pipe(gulp.dest(`${paths.src}/sass/vendors/hover.css`));

  return stream;
});

// Deleting the files distributed by the copy-assets task
// TODO: Untested
gulp.task("clean-vendor-assets", function() {
  return del([
    `${paths.src}/js/vendors/bootstrap4/**`,
    `${paths.src}/sass/vendors/bootstrap4/**`,
    "./fonts/*wesome*.{ttf,woff,woff2,eot,svg}",
    `${paths.src}/sass/vendors/fontawesome/**`,
    `${paths.src}/sass/vendors/underscores/**`,
    `${paths.src}/js/skip-link-focus-fix.js`,
    `${paths.js}/**/skip-link-focus-fix.js`,
    `${paths.js}/**/popper.min.js`,
    `${paths.js}/**/popper.js`,
    paths.vendor !== "" ? `${paths.js}${paths.vendor}/**` : ""
  ]);
});

// Deleting any file inside the /dist folder
gulp.task("clean-dist", function() {
  return del([
    `!${paths.dist}/.git/**`,
    `!${paths.dist}/.gitinclude`,
    // ignorePaths,
    // ignoreFiles,
    `${paths.dist}/**`
  ]);
});

// Run
// gulp dist
// Copies the files to the /dist folder for distribution as simple theme
gulp.task(
  "dist",
  gulp.series(function copyToDistFolder() {
    return gulp
      .src(["**/*", ...ignorePaths, ...ignoreFiles, "*"], { buffer: false })
      .pipe(
        replace("/js/jquery.slim.min.js", `/js${paths.vendor}/jquery.slim.min.js`, {
          skipBinary: true
        })
      )
      .pipe(
        replace("/js/popper.min.js", `/js${paths.vendor}/popper.min.js`, {
          skipBinary: true
        })
      )
      .pipe(
        replace("/js/skip-link-focus-fix.js", `/js${paths.vendor}/skip-link-focus-fix.js`, {
          skipBinary: true
        })
      )
      .pipe(gulp.dest(paths.dist));
  })
);

gulp.task("dist-post", function() {
  return del([...deletePaths, ...deleteFiles]);
});

// Generate build
gulp.task("build", shell.task(["mkdir -p build", `sh unix_build.sh`]));

// Execute all linters
gulp.task("lint", gulp.parallel("eslint", "sass-lint"));

// Deleting any file inside the /dist-product folder
gulp.task("compile", gulp.series("lint", "styles", "scripts", "dist", "build"));

// Setup styles & scripts to test it
gulp.task("setup", gulp.series("lint", "styles", "scripts"));

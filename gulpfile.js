/*
  Gulp tasks
  ==========
  gulp
  gulp build
  gulp build:serve
*/

var gulp = require('gulp'),
  watch = require('gulp-watch'),
  config = require('./config.json'),
  stylus = require('gulp-stylus'),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  browserSync = require('browser-sync').create(),
  reload = browserSync.reload,
  concat = require('gulp-concat'),
  plumber = require('gulp-plumber'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  del = require('del'),
  nunjucksRender = require('gulp-nunjucks-render'),
  htmlreplace = require('gulp-html-replace');

// Scripts tasks
gulp.task('scripts:vendors', function () {
  return gulp.src(config.jsConcatFiles)
    .pipe(plumber())
    .pipe(sourcemaps.init())
      .pipe(concat('vendors.js'))
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest(config.path.src + '/js/'));
});
gulp.task('scripts:vendors:min', ['scripts:vendors'], function () {
  return gulp.src(config.path.src + '/js/vendors.js')
    .pipe(plumber())
    .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(
        rename({
          suffix: '.min'
        })
      )
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest(config.path.src + '/js/'));
});
gulp.task('scripts:app', function () {
  return gulp.src(config.path.src + '/js/app.js')
    .pipe(plumber())
    .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(
        rename({
          suffix: '.min'
        })
      )
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest(config.path.src + '/js/'));
});
gulp.task('scripts', ['scripts:vendors', 'scripts:vendors:min', 'scripts:app']);

// Styles tasks
gulp.task('styles', function () {
  return gulp.src(config.path.src + '/stylus/app.styl')
    .pipe(plumber())
    .pipe(stylus())
    .pipe(gulp.dest(config.path.src + '/css'))
    .pipe(sourcemaps.init())
      .pipe(
        stylus({
          compress: true
        })
      )
      .pipe(
        rename({
          suffix: '.min'
        })
      )
      .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
      })
    )
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest(config.path.src + '/css'));
});

// Nunjucks tasks
// task to render html
gulp.task('nunjucks:render', function () {
  return watch(config.path.src + '/templates/pages/**/*.+(html|nunjucks)', { ignoreInitial: false })
    // Renders template with nunjucks
    .pipe(
      nunjucksRender({
        path: [config.path.src + '/templates']
      })
    )
    // Output files in app folder
    .pipe(gulp.dest(config.path.src));
});

// task to reload after nunjuck's rendered
gulp.task('nunjucks', ['nunjucks:render'], function (done) {
  browserSync.reload();
  done();
});

// Browser-Sync tasks
gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: config.path.src
    }
  });
});

// Build tasks
// task to clean out all files and folders from build folder
gulp.task('build:clean', ['nunjucks', 'scripts', 'styles'], function () {
  return del([
    config.path.build+'/**'
  ]);
});

// task to create build directory of all files
gulp.task('build:copy', ['build:clean'], function () {
  return gulp.src([config.path.src+'/**/*/', '!'+config.path.src+'/templates', '!'+config.path.src+'/maps'])
    .pipe(gulp.dest(config.path.build));
});

// task to removed unwanted build files
gulp.task('build:remove', ['build:copy'], function () {
  return del(config.buildFilesFoldersRemove);
});

// task to removed unwanted build files
gulp.task('build:html', ['build:remove'], function () {
  return gulp.src(config.path.build+'/**/*.html')
    .pipe(htmlreplace({
        'js': {
          src: [['js', 'app.min.js']],
          tpl: '<script src="%s/%s"></script>'
        }
    }, {
      keepUnassigned: false,
      keepBlockTags: false,
      resolvePaths: false
    }))
    .pipe(gulp.dest(config.path.build));
});

gulp.task('build', ['build:html']);

// task to run build server for testing final app
gulp.task('build:serve', function () {
  browserSync.init({
    server: {
      baseDir: config.path.build
    }
  });
});

// Watch tasks
gulp.task ('watch', function () {
  gulp.watch(config.path.src+'/templates/**/*.+(html|nunjucks)', ['nunjucks']);
  gulp.watch(config.path.src+'/stylus/**/*.styl', ['styles']);
  gulp.watch(config.path.src+'/js/vendors/**/*.js', ['scripts:vendors', 'scripts:vendors:min']);
  gulp.watch(config.path.src+'/js/app.js', ['scripts:app']);
  gulp.watch(config.path.src+'/**/*.+(html|js|css)', reload);
});

// Gulp default
gulp.task('default', ['nunjucks', 'scripts', 'styles', 'browser-sync', 'watch']);

